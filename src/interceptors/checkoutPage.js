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

    const PriceSummary = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CartPage/PriceSummary/priceSummary.js'
    );

    const CheckoutPaymentMethods = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentMethods.js'
    );

    const CheckoutPaymentInformation = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentInformation.js'
    );

    const surchargeSummary = PriceSummary.addImport(
        'SurchargeSummary from "@worldline/worldline-payment/src/components/Surcharge/surchargeSummary.js";'
    );

    const useWlPriceSummary = PriceSummary.addImport(
        'useWlPriceSummary from "@worldline/worldline-payment/src/talons/CartPage/PriceSummary/useWlPriceSummary";'
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

    //--------------------------------------//
    // START: SURCHARGE
    // provide data from the payment methods to the parent checkout component
    //--------------------------------------//

    CheckoutPage.insertBeforeSource(
        'onSave={setShippingMethodDone}',
        'onSave={setShippingMethodDoneWorldline}',
        { remove: 30 }
    );

    CheckoutPage.insertBeforeSource(
        '} = talonProps;',
        ',\n     getPaymentMethodValue,' +
              ' \n     checkSurchargeStatus,' +
              ' \n     isSurchargeValid,' +
              ' \n     checkSurchargeCalculated,' +
              ' \n     setShippingMethodDoneWorldline,'
    );

    CheckoutPage.insertBeforeSource(
        'onSave={setPaymentInformationDone}',
        'onSelect={getPaymentMethodValue} \n' +
              'checkSurchargeStatus={checkSurchargeStatus} \n' +
              'isSurchargeValid={isSurchargeValid} \n' +
              'checkSurchargeCalculated={checkSurchargeCalculated} \n'
    );

    CheckoutPage.insertBeforeSource(
        'reviewOrderButtonClicked ||',
        '!checkSurchargeStatus() || \n'
    );

    CheckoutPaymentInformation.insertAfterSource(
        'classes: propClasses,',
        '\n        onSelect,' +
              '\n        checkSurchargeStatus,' +
              '\n        isSurchargeValid,' +
              '\n        checkSurchargeCalculated,'
    );

    CheckoutPaymentInformation.insertBeforeSource(
        'onPaymentError={handlePaymentError}',
        '\n        onSelect={onSelect}' +
              '\n        checkSurchargeStatus={checkSurchargeStatus}' +
              '\n        isSurchargeValid={isSurchargeValid}' +
              '\n        checkSurchargeCalculated={checkSurchargeCalculated}'
    );

    CheckoutPaymentInformation.insertAfterSource(
        'const talonProps = usePaymentInformation({',
        '\n        onSelect,' +
              '\n        isSurchargeValid,' +
              '\n        checkSurchargeStatus,' +
              '\n        checkSurchargeCalculated,'
    );

    CheckoutPaymentMethods.insertAfterSource(
        'classes: propClasses,',
        '\n        onSelect,' +
              '\n        isSurchargeValid,' +
              '\n        checkSurchargeStatus,' +
              '\n        checkSurchargeCalculated,'
    );

    CheckoutPaymentMethods.insertAfterSource(
        '<Radio',
        '\n onChange={e => onSelect(e)}'
    );

    PriceSummary.insertBeforeSource(
        'const talonProps = usePriceSummary();',
        `const talonProps = ${useWlPriceSummary}();`,
        { remove: 37 }
    );

    PriceSummary.insertBeforeSource(
        '} = flatData;',
        ', \n surcharge'
    );

    PriceSummary.insertAfterJSX(
        'ShippingSummary',
        `${surchargeSummary}
            classes={{
                lineItemLabel: classes.lineItemLabel,
                price: priceClass
            }}
            data={surcharge}
            isCheckout={isCheckout}
        `
    )

    //--------------------------------------//
    // END: SURCHARGE
    //--------------------------------------//


    CheckoutPage.insertAfterSource(
    'handlePlaceOrder,',
    '\n     customHandlePlaceOrder,'
    );

    CheckoutPage.insertAfterSource(
    'onClick={handlePlaceOrder}',
    'onClick={customHandlePlaceOrder}',
    { remove: 26 }
    );

    CheckoutPaymentMethodSummary.insertAfterSource(
    'const { isLoading, selectedPaymentMethod } = talonProps;',
    `
        if (selectedPaymentMethod) {
            localStorage.setItem('selectedPaymentMethod', JSON.stringify(selectedPaymentMethod));
        }`
    );

    CheckoutPaymentMethods.insertAfterSource(
    '<PaymentMethodComponent',
    '\n     paymentCode={code}' +
          '\n     checkSurchargeStatus={checkSurchargeStatus}' +
          '\n     isSurchargeValid={isSurchargeValid}' +
          '\n     checkSurchargeCalculated={checkSurchargeCalculated}'
    );
};
