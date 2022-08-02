module.exports = (targets) => {
    const peregrineTargets = targets.of("@magento/peregrine");
    const talonsTarget = peregrineTargets.talons;
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    const paymentMethodsGql = targetables.reactComponent(
        '@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/paymentMethods.gql.js'
    );
    const PaymentInformationGql = targetables.reactComponent(
        '@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/paymentInformation.gql.js'
    );
    const iconsFragment = `\nicons {\nicon_title\nicon_url \n}`;
    paymentMethodsGql.insertAfterSource(
        'available_payment_methods {',
        iconsFragment
    );
    PaymentInformationGql.insertAfterSource(
        'available_payment_methods {',
        iconsFragment
    );
};
