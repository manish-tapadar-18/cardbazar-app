import { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
    Home: undefined;
    GameRules: undefined;
    Account: undefined;
    GameTimings: undefined;
    TransactionHistory: undefined;
    PlayHistory: undefined;
    LanguageOptions: undefined;
    Refer: undefined;
    AddMoney: undefined;
    ShareApp: undefined;
};

export type AddMoneyStackParamList = {
    AddMoney: undefined;
};

export type PlayHistoryStackParamList = {
    PlayHistory: undefined;
};

export type ResultStackParamList = {
    Result: undefined;
};

export type BottomTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    AddMoneyTab: NavigatorScreenParams<AddMoneyStackParamList>;
    PlayHistoryTab: NavigatorScreenParams<PlayHistoryStackParamList>;
    ResultTab: NavigatorScreenParams<ResultStackParamList>;
};

export type DrawerParamList = {
    MainTabs: NavigatorScreenParams<BottomTabParamList>;
};
