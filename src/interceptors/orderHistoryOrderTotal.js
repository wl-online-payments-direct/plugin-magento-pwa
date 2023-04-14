module.exports = (targets) => {
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    const OrderHistoryOrderTotal = targetables.reactComponent(
        '@magento/venia-ui/lib/components/OrderHistoryPage/OrderDetails/orderTotal.js'
    );

    const SurchargeSummaryWrapper = OrderHistoryOrderTotal.addImport(
        'SurchargeSummaryWrapper from "@worldline/worldline-payment/src/components/Surcharge/surchargeSummaryWrapper.js";'
    );

    OrderHistoryOrderTotal.insertAfterJSX(
        '<div className={classes.shipping}>',
        `${SurchargeSummaryWrapper}
            surcharge={data.worldline_surcharging}
        `
    )
};
