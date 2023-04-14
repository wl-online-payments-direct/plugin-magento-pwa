module.exports = (targets) => {
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    const orderHistoryPageGql = targetables.reactComponent(
        '@magento/peregrine/lib/talons/OrderHistoryPage/orderHistoryPage.gql.js'
    );

    const surchargingFragment = `\nworldline_surcharging {\namount\nbase_amount\ncurrency_code \n}`;

    orderHistoryPageGql.insertAfterSource(
        'total {',
        surchargingFragment
    );
};
