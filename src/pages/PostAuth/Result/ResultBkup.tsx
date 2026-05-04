import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import React, { useState } from 'react'
import { StyleSheet, Text, View, Dimensions, Image, StatusBar, ScrollView, FlatList, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux';
import { CustomGradientText, CustomText } from '../components/CustomText';
import GameBar from '../components/GameBar';
import GradientView from '../components/GradientView';
import { changeLoginStatus } from '../redux/auth/auth';
import { URI } from '../utils/AppUri';
import { Colors } from '../utils/Colors';
import { FontFamilyWithWeight } from '../utils/FontFamilyWithWeight';
import { Fonts } from '../utils/Fontsizes';
import { Images } from '../utils/ImagePath';
import { GETCALL, POSTCALL } from '../utils/PostAuthNetwork';
import { Spaces } from '../utils/Spaces';
import { clearStorage, getObjectFromStorage } from '../utils/Storage';
import _ from "lodash";
import { getTextByLangauge, logObject } from '../utils/CommonFunction';
import AnimatedLoader from "react-native-animated-loader";
import Loader from '../assets/lottie/loader';
import { WORKING_URL } from '../utils/Constants';
import { setConnection } from '../redux/noConnection/NoConnectionModal';
const { width, height } = Dimensions.get('screen');

const SERIESCONTAINERHEIGHT = 100

const Result = ({ navigation }) => {

  const dispatch = useDispatch();
  const [visible, setVisible] = React.useState(false);
  const [gameCategories, setGameCategories] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [pageNum, setPageNum] = React.useState(0);
  const [totalData, setTotalData] = React.useState(0);
  const [visibleDataCount, setVisibleDataCount] = React.useState(0);
  const [isRefreshing, setRefreshing] = React.useState(false);
  const [resultList, setResultList] = React.useState([]);
  const PER_PAGE_DATA = 30;
  const { language, selectedLanguage } = useSelector((state) => state.languageRedux);
  useFocusEffect(React.useCallback(() => {
    getProfileDetails();
    getAllCategories();
  }, []));

  const getProfileDetails = async () => {
    let storedUserData = await getObjectFromStorage('loggedInUserData');
    let body = { EMAIL: storedUserData.EMAIL };
    let { data } = await POSTCALL(URI.USERDETAILS, body);
    if (data.code == 200 && data.status == "success" && data.data.STATUS == "INACTIVE") {
      await clearStorage()
      dispatch(changeLoginStatus(false));
    } else {
      return true
    }
  }

  const getAllCategories = async () => {
    setVisible(true);
    try {
      const { data } = await GETCALL(URI.GETALLGAMECATEGORY);
      setGameCategories(data.data)
      if (data.data.length) {
        let basicCategoryId = data.data[0].ID;
        getResultList(null, 0, basicCategoryId)
        setSelectedCategory(basicCategoryId);
      }
    } catch (error) {
      setVisible(false)
      showMessage({
        message: error.message,
        type: "danger",
        backgroundColor: Colors.ERROR_RED
      });
    }
  }

  const getText = (text) => {
    if (selectedLanguage) {
      return language.hasOwnProperty(text) ? language[text].hasOwnProperty(selectedLanguage) ? language[text][selectedLanguage] : text : text
    } else {
      return text;
    }
  }

  const getResultList = async (filterCondition = null, pageNumber = 0, categoryId = null) => {
    let searchCondition;
    if (filterCondition) {
      searchCondition = filterCondition;
    } else {
      searchCondition = {
        "filters": {
          "search": [
            {
              "FIELD_NAME": "GAME_MASTER.NAME",
              "FIELD_VALUE": "",
              "OPT": "LIKE"
            },
            {
              "FIELD_NAME": "GAME_MASTER.CATEGORY_ID",
              "FIELD_VALUE": `${categoryId}`,
              "OPT": "="
            },
            {
              "FIELD_NAME": "GAME_CATEGORY.STATUS",
              "FIELD_VALUE": "ACTIVE",
              "OPT": "="
            },
            {
              "FIELD_NAME": "GAME_MASTER.GAME_DATE",
              "FIELD_VALUE": `${moment().format("YYYY-MM-DD")}`,
              "OPT": "<="
            }
          ],
          "sortFilter": {
            "FIELD_NAME": "GAME_MASTER.GAME_DATE",
            "SORT_ORDER": "DESC"
          }
        }
      }

    }
    try {
      setVisible(true);
      let { data } = await POSTCALL(`${URI.GETALLGAMERESULT}&skip=${PER_PAGE_DATA * pageNumber}&take=${PER_PAGE_DATA}`, searchCondition);
      setVisible(false);
      setRefreshing(false)

      if (data.code == 200 && data.status == "success") {
        setTotalData(data.data.TOTAL);
        let results = data.data.DATA;
        let formattedResults = [];
        results.forEach((result, _) => {
          let obj = {};
          let publishedSchedule = result.SCHEDULE_DETAILS.filter((scheduleDetail, _) => scheduleDetail.RESULT_PUBLISH != 0);
          if (publishedSchedule.length) {
            obj['GAME_DATE'] = result.GAME_DATE;
            obj['DATA'] = publishedSchedule
            formattedResults.push(obj)
          }
        })
        setResultList(formattedResults)
      } else {
        showMessage({
          message: data.data.message,
          type: "danger",
          backgroundColor: Colors.ERROR_RED,
          duration: 1500
        });
      }
    } catch (error) {
      setVisible(false);
      showMessage({
        message: error.message,
        type: "danger",
        backgroundColor: Colors.ERROR_RED,
        duration: 1500
      });
    }
  }

  const renderResultData = ({ item }) => {
    const { GAME_DATE, DATA } = item;
    return (
      <GradientView
        customStyle={styles.seriesContainer}
        gradientColors={["#451563", "#42125C", "#4C186B"]}>
        <GradientView
          customStyle={styles.labelContainer}
          gradientColors={[Colors.GRADIENT.RED, Colors.GRADIENT.YELLOW]}
        >
          <CustomText children={GAME_DATE.substring(0, 10)} customStyle={styles.labelContainerText} />
        </GradientView>
        {DATA.map((single, index) => {
          let { NAME, CARD_IMAGE_URL, CARD_NAME } = single;
          return (
            <View key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: Colors.WHITE,
                marginHorizontal: 8
              }}
            >
              <View style={{ width: '50%' }}>
                <CustomGradientText
                  textStyle={{ ...styles.textLabel, marginHorizontal: 10 }}
                  colors={["#FDD105", "#FFE607"]}
                  text={getText(NAME)}
                />
              </View>

              <Image
                style={{
                  width: 60,
                  height: 60,
                  resizeMode: 'contain',
                  transform: [{ rotate: '-10deg' }]
                }}
                source={{
                  uri: `${WORKING_URL}${CARD_IMAGE_URL}`
                }}
              />
              <View style={{ width: Spaces.regular }} />
              <CustomText children={getText(CARD_NAME)} customStyle={{ color: Colors.WHITE, fontSize: Fonts.small, textTransform: 'capitalize' }} />
            </View>
          )

        })}

        {/* <View style={{ height: 2, backgroundColor: Colors.WHITE, marginVertical: 5 }} /> */}
      </GradientView>
    );
  };

  const refetchData = async () => {
    let searchCondition = {
      "filters": {
        "search": [
          {
            "FIELD_NAME": "GAME_MASTER.NAME",
            "FIELD_VALUE": "",
            "OPT": "LIKE"
          },
          {
            "FIELD_NAME": "GAME_MASTER.CATEGORY_ID",
            "FIELD_VALUE": `${selectedCategory}`,
            "OPT": "="
          },
          {
            "FIELD_NAME": "GAME_CATEGORY.STATUS",
            "FIELD_VALUE": "ACTIVE",
            "OPT": "="
          },
          {
            "FIELD_NAME": "GAME_MASTER.GAME_DATE",
            "FIELD_VALUE": `${moment().format("YYYY-MM-DD")}`,
            "OPT": "<="
          }
        ],
        "sortFilter": {
          "FIELD_NAME": "GAME_MASTER.GAME_DATE",
          "SORT_ORDER": "DESC"
        }
      }
    }
    let pageNumber = pageNum + 1;
    setPageNum(pageNumber)
    try {
      setVisible(true);
      let { data } = await POSTCALL(`${URI.GETALLGAMERESULT}&skip=${PER_PAGE_DATA * pageNumber}&take=${PER_PAGE_DATA}`, searchCondition);
      setVisible(false);
      if (data.code == 200 && data.status == "success") {
        setTotalData(data.data.TOTAL);
        let results = data.data.DATA;
        let formattedResults = [];
        results.forEach((result, _) => {
          let obj = {};
          let publishedSchedule = result.SCHEDULE_DETAILS.filter((scheduleDetail, _) => scheduleDetail.RESULT_PUBLISH != 0);
          if (publishedSchedule.length) {
            obj['GAME_DATE'] = result.GAME_DATE;
            obj['DATA'] = publishedSchedule
            formattedResults.push(obj)
          }
        })
        setResultList([...resultList, ...formattedResults])
      } else {
        showMessage({
          message: data.data.message,
          type: "danger",
          backgroundColor: Colors.ERROR_RED,
          duration: 1500
        });
      }
    } catch (error) {
      setVisible(false);
      showMessage({
        message: error.message,
        type: "danger",
        backgroundColor: Colors.ERROR_RED,
        duration: 1500
      });
    }
  }

  const getAllResultOnPull = async () => {
    let searchCondition = {
      "filters": {
        "search": [
          {
            "FIELD_NAME": "GAME_MASTER.NAME",
            "FIELD_VALUE": "",
            "OPT": "LIKE"
          },
          {
            "FIELD_NAME": "GAME_MASTER.CATEGORY_ID",
            "FIELD_VALUE": `${selectedCategory}`,
            "OPT": "="
          },
          {
            "FIELD_NAME": "GAME_CATEGORY.STATUS",
            "FIELD_VALUE": "ACTIVE",
            "OPT": "="
          },
          {
            "FIELD_NAME": "GAME_MASTER.GAME_DATE",
            "FIELD_VALUE": `${moment().format("YYYY-MM-DD")}`,
            "OPT": "<="
          }
        ],
        "sortFilter": {
          "FIELD_NAME": "GAME_MASTER.GAME_DATE",
          "SORT_ORDER": "DESC"
        }
      }
    }
    setPageNum(0)
    try {
      setRefreshing(true);
      let { data } = await POSTCALL(`${URI.GETALLGAMERESULT}&skip=0&take=${PER_PAGE_DATA}`, searchCondition);
      setRefreshing(false);
      if (data.code == 200 && data.status == "success") {
        setTotalData(data.data.TOTAL);
        let results = data.data.DATA;
        let formattedResults = [];
        results.forEach((result, _) => {
          let obj = {};
          let publishedSchedule = result.SCHEDULE_DETAILS.filter((scheduleDetail, _) => scheduleDetail.RESULT_PUBLISH != 0);
          if (publishedSchedule.length) {
            obj['GAME_DATE'] = result.GAME_DATE;
            obj['DATA'] = publishedSchedule
            formattedResults.push(obj)
          }
        })
        setResultList(formattedResults)
      } else {
        showMessage({
          message: data.data.message,
          type: "danger",
          backgroundColor: Colors.ERROR_RED,
          duration: 1500
        });
      }
    } catch (error) {
      setRefreshing(false);
      showMessage({
        message: error.message,
        type: "danger",
        backgroundColor: Colors.ERROR_RED,
        duration: 1500
      });
    }
  }

  return (
    <View style={styles.conatiner}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.STATUS_BAR_COLOR} />
      <AnimatedLoader
        visible={visible}
        overlayColor="rgba(255,255,255,0.75)"
        source={Loader}
        animationStyle={styles.lottie}
        speed={1}
      ></AnimatedLoader>
      <Image
        source={Images.DASHBOARD_SPLASH}
        style={styles.backgroundImage}
      />
      <GameBar
        gameRulesStatus={true}
        referEarnStatus={true}
        gameTimingsStatus={true}
        navigateTo={(path) => {
          navigation.navigate(path);
        }}
        isShown={false}
      />
      <GradientView
        customStyle={styles.gameOptionsContainer}
        gradientColors={["#3A1A72", "#431673", "#501477", "#401874", "#511478", "#5D117A"]}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }}
          showsHorizontalScrollIndicator={false}
          horizontal={true}>
          {gameCategories.map((category, index) => {
            let { NAME, ID } = category;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setSelectedCategory(ID);
                  setPageNum(0);
                  getResultList(null, 0, ID)
                }}
              >
                <CustomGradientText
                  textStyle={{ ...styles.textLabel, marginHorizontal: 10 }}
                  colors={ID == selectedCategory ? ["#FDD105", "#FFE607"] : [Colors.WHITE, Colors.WHITE]}
                  text={getText(NAME)}
                />
              </TouchableOpacity>

            )
          })}
        </ScrollView>
      </GradientView>
      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1, paddingBottom: SERIESCONTAINERHEIGHT + 120, paddingVertical: 24 }}
          data={resultList}
          ItemSeparatorComponent={() => <View style={{ height: Spaces.veryLarge }} />}
          renderItem={renderResultData}
          ListEmptyComponent={() => <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            {!visible && resultList.length == 0 && <Text style={styles.noDataText}>{getTextByLangauge("No Data Found")}</Text>}
          </View>}
          refreshing={isRefreshing}
          onRefresh={getAllResultOnPull}
          keyExtractor={(_, index) => index.toString()}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          onEndReached={({ distanceFromEnd }) => {
            if (distanceFromEnd <= 0) return;
            else {
              console.log("======", distanceFromEnd);
              refetchData()
            }

          }}
        />
      </View>


    </View>
  )
}

export default Result

const styles = StyleSheet.create({
  conatiner: {
    flex: 1
  },
  backgroundImage: {
    ...StyleSheet.absoluteFill,
    width: width,
    height: height
  },
  gameOptionsContainer: {
    height: 40
  },
  textStyle: {
    fontSize: Fonts.large,
    fontFamily: FontFamilyWithWeight[900],
    letterSpacing: 1,
    paddingHorizontal: 15
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  seriesContainer: {
    marginHorizontal: 8,
    minHeight: SERIESCONTAINERHEIGHT,
    paddingTop: 32,
    borderRadius: 10,
    paddingBottom: 16,
  },
  labelContainer: {
    position: 'absolute',
    zIndex: 9999,
    top: -10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 5
  },
  gameStatusContainer: {
    padding: 5,
    borderRadius: 5,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center'
  },
  labelContainerText: {
    color: Colors.DARK_BROWN,
    fontSize: Fonts.small,
    fontFamily: FontFamilyWithWeight[800]
  },
  statusContainerText: {
    color: Colors.WHITE,
    fontSize: Fonts.small,
    fontFamily: FontFamilyWithWeight[800]
  },
  textLabel: {
    color: Colors.YELOW,
    fontSize: Fonts.small,
    fontFamily: FontFamilyWithWeight[700]
  },
  lottie: {
    width: height * .25,
    height: height * .25
  },
  noDataText: {
    color: Colors.WHITE,
    fontFamily: FontFamilyWithWeight[700],
    fontSize: Fonts.xLarge
  }
})