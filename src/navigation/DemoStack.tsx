import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DemoStackParamList } from '../types/NavigationStack';
import CardList from '../pages/Demo/CardList';
import Cart from '../pages/Demo/Cart';
import MyAddress from '../pages/Demo/MyAddress';
import SuccessOrder from '../pages/Demo/SuccessOrder';

const Stack = createNativeStackNavigator<DemoStackParamList>();

export default function DemoStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CardList" component={CardList} />
            <Stack.Screen name="Cart" component={Cart} />
            <Stack.Screen name="MyAddress" component={MyAddress} />
            <Stack.Screen name="SuccessOrder" component={SuccessOrder} />
        </Stack.Navigator>
    );
}
