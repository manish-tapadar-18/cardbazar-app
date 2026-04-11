import { useFocusEffect } from "@react-navigation/native";
import { useUserStore } from "../stores/userStore";
import AuthStack from "./AuthStack";
import { RootDrawer } from "./RootDrawer";
import React from "react";
import { http } from "../utils/http";
import { UriRepo } from "../utils/UriRepo";
import { useLanguageStore, LanguageData } from "../stores/languageStore";
import LanguageSelectionModal from "../components/LanguageSelectionModal";

export default function AppNavigator() {
    const { isAuthenticated } = useUserStore();
    const { setLanguages } = useLanguageStore();

    useFocusEffect(React.useCallback(() => {
        loadAllLanguages();
    }, []))

    const loadAllLanguages = async () => {
        let response = await http.get(UriRepo.GETALLLANGUAGE);
        if (response?.data) {
            setLanguages(response.data as LanguageData);
        }
    }
    return (
        <>
            {isAuthenticated ? <RootDrawer /> : <AuthStack />}
            <LanguageSelectionModal />
        </>
    );
}