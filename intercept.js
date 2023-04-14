const SavedPaymentTypes = require('@magento/venia-ui/lib/targets/SavedPaymentTypes.js');
const RedirectPaymentIds = require("./src/components/RedirectPaymentProducts/payment_ids");
const fs = require('fs');

module.exports = targets => {
    const { specialFeatures } = targets.of('@magento/pwa-buildpack');
    const { Targetables } = require('@magento/pwa-buildpack');
    const RedirectPaymentIds = require('@worldline/worldline-payment/src/components/RedirectPaymentProducts/payment_ids');
    const pathToPayments = 'src/components/RedirectPaymentProducts/products';
    const pathToVaultPayments = 'src/components/RedirectPaymentProducts/vault';
    const pathToSavedPayments = 'src/components/RedirectPaymentProducts/saved';

    specialFeatures.tap(flags => {
        flags[targets.name] = {
            esModules: true,
            cssModules: true
        };
    });

    const { checkoutPagePaymentTypes, savedPaymentTypes } = targets.of(
        '@magento/venia-ui'
    );

    fs.readFile(
        `${__dirname}/${pathToPayments}/sample.js`,
        function(err, data) {
            if (err) throw err;

            RedirectPaymentIds.map(element => {
                processFile(pathToPayments, element, data, 'checkout')
            });
        }
    );

    fs.readFile(
        `${__dirname}/${pathToVaultPayments}/sample.js`,
        function(err, data) {
            if (err) throw err;

            RedirectPaymentIds.map(element => {
                processFile(pathToVaultPayments, element, data, 'checkout_vault')
            });
        }
    );

    fs.readFile(
        `${__dirname}/${pathToSavedPayments}/sample.js`,
        function(err, data) {
            if (err) throw err;

            RedirectPaymentIds.map(element => {
                processFile(pathToSavedPayments, element, data, 'saved')
            });
        }
    );

    function processFile(path, element, data, instruction) {
        let pathFile = `${__dirname}/${path}/${element}.js`;

        if (!fs.existsSync(pathFile)) {
            fs.appendFile(pathFile, data.toString(),function (err) {
                if (err) throw err;
            });
        }

        switch (instruction) {
            case 'checkout': {
                checkoutPagePaymentTypes.tap(payments =>
                    payments.add({
                        paymentCode: `worldline_redirect_payment_${element}`,
                        importPath: `@worldline/worldline-payment/${path}/${element}.js`
                    })
                );

                break;
            }

            case 'checkout_vault': {
                checkoutPagePaymentTypes.tap(payments =>
                    payments.add({
                        paymentCode: `worldline_redirect_payment_${element}_vault`,
                        importPath: `@worldline/worldline-payment/${path}/${element}.js`
                    })
                );

                break;
            }

            case 'saved': {
                savedPaymentTypes.tap(payments =>
                    payments.add({
                        paymentCode: `worldline_redirect_payment_${element}`,
                        importPath: `@worldline/worldline-payment/${path}/${element}.js`
                    })
                );

                break;
            }
        }
    }

    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_cc',
            importPath:
                '@worldline/worldline-payment/src/components/worldLine.js'
        })
    );
    checkoutPagePaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_cc_vault',
            importPath:
                '@worldline/worldline-payment/src/components/Vault/worldLineVault.js'
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
            paymentCode: 'worldline_cc_vault',
            importPath:
                '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineVault.js'
        })
    );
    savedPaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_hosted_checkout',
            importPath:
                '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineHostedCheckout.js'
        })
    );
    savedPaymentTypes.tap(payments =>
        payments.add({
            paymentCode: 'worldline_hosted_checkout_vault',
            importPath:
                '@worldline/worldline-payment/src/components/SavedPaymentsPage/worldLineHostedCheckoutVault.js'
        })
    );

    targets.of('@magento/venia-ui').routes.tap(routes => {
        routes.push({
            name: 'WorldLine Success',
            pattern: '/worldline/success',
            path: require.resolve('./src/components/Success')
        });
        return routes;
    });

    require('./src/interceptors/checkoutPage')(targets);
    require('./src/interceptors/paymentMethodGQL')(targets);
    require('./src/interceptors/orderHistoryPaymentMethod')(targets);
    require('./src/interceptors/orderHistoryPageGQL')(targets);
    require('./src/interceptors/orderHistoryOrderTotal')(targets);
    require('./src/interceptors/paymentRadioOption')(targets);
};
