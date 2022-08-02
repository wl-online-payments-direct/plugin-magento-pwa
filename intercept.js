const SavedPaymentTypes = require('@magento/venia-ui/lib/targets/SavedPaymentTypes.js')
module.exports = targets => {
    const { specialFeatures } = targets.of('@magento/pwa-buildpack');

    const { Targetables } = require('@magento/pwa-buildpack');
    specialFeatures.tap(flags => {
        flags[targets.name] = {
            esModules: true,
            cssModules: true
        };
    });
    const {
        checkoutPagePaymentTypes,
        savedPaymentTypes
    } = targets.of('@magento/venia-ui');
    //
    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_cc',
            importPath:
                '@worldline/worldline-payment/src/components/worldLine.js'
        })
    );
    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_hosted_checkout',
            importPath:
                '@worldline/worldline-payment/src/components/worldLineHostedCheckout.js'
        })
    );
    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_hosted_checkout_vault',
            importPath:
                '@worldline/worldline-payment/src/components/Vault/worldLineHostedCheckoutVault.js'
        })
    );
    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_cc_vault',
            importPath:
                '@worldline/worldline-payment/src/components/Vault/worldLineVault.js'
        })
    );

    savedPaymentTypes.tap(payments =>
        payments.add({
                paymentCode: 'worldline_cc',
                importPath:
                    '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineCC.js',
                name: 'Worldline Credit Card'
        })
    );
    savedPaymentTypes.tap(payments =>
        payments.add({
                paymentCode: 'worldline_hosted_checkout',
                importPath: '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineHostedCheckout.js'
        })
    );
    savedPaymentTypes.tap(payments =>
        payments.add({
                paymentCode: 'worldline_cc_vault',
                importPath: '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineVault.js'
        })
    );

    savedPaymentTypes.tap(payments =>
        payments.add({
                paymentCode: 'worldline_hosted_checkout_vault',
                importPath: '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineHostedCheckoutVault.js'
        })
    );

    targets.of("@magento/venia-ui").routes.tap((routes) => {
        routes.push({
            name: "WorldLine Success",
            pattern: "/worldline/success",
            path: require.resolve("./src/components/Success")
        });
        return routes;
    });

    require('./src/interceptors/checkoutPage')(targets);
    require('./src/interceptors/paymentMethodGQL')(targets);
};
