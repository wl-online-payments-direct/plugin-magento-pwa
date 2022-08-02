module.exports = (targets) => {
    const peregrineTargets = targets.of("@magento/peregrine");
    const talonsTarget = peregrineTargets.talons;
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    const CheckoutPage = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/checkoutPage.js'
    );

    const CheckoutPaymentMethodSummary = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/summary.js'
    );

    talonsTarget.tap((talonWrapperConfig) => {
        talonWrapperConfig.CheckoutPage.useCheckoutPage.wrapWith(
            "@worldline/worldline-payment/src/talons/CheckoutPage/useCheckoutPage.js"
        );
    });

    CheckoutPage.insertAfterSource(
        'let checkoutContent;',
        `
            useEffect(() => {
                localStorage.setItem('orderNumber', JSON.stringify(orderNumber));
                localStorage.setItem('orderDetailsData', JSON.stringify(orderDetailsData));
            }, [orderDetailsData]);
        `
    );

    CheckoutPage.insertBeforeSource(
        'orderNumber && orderDetailsData',
        'talonProps.checkRedirect === null && '
    );

    CheckoutPaymentMethodSummary.insertAfterSource(
        'const { isLoading, selectedPaymentMethod } = talonProps;',
        `
            if (selectedPaymentMethod) {
                localStorage.setItem('selectedPaymentMethod', JSON.stringify(selectedPaymentMethod));
            }
        `
    );
};
