module.exports = (targets) => {
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);

    const OrderHistoryPaymentMethod = targetables.reactComponent(
        '@magento/venia-ui/lib/components/OrderHistoryPage/OrderDetails/paymentMethod.js'
    );

    OrderHistoryPaymentMethod.prependSource('import PaymentAdditionalInfo from "@worldline/worldline-payment/src/components/PaymentAdditionalInfo";');

    OrderHistoryPaymentMethod.insertAfterSource(
        '<div className={classes.payment_type}>{name}</div>',
        `
            <PaymentAdditionalInfo data={data} />
        `
    );
};
