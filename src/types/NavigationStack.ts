export type AuthStackParamList = {
    Splash: undefined;
    Authentication: undefined;
    ForgetPassword: undefined;
}

export type DemoStackParamList = {
    CardList: undefined;
    Cart: undefined;
    MyAddress: { fromCart: boolean };
    SuccessOrder: { totalAmount: number; itemCount: number };
};