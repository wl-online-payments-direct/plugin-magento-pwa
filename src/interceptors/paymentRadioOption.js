module.exports = (targets) => {
    const { Targetables } = require('@magento/pwa-buildpack');
    const targetables = Targetables.using(targets);
    const PaymentRadioGroup = targetables.reactComponent(
        '@magento/venia-ui/lib/components/RadioGroup/radio.js'
    );
    const PaymentMethod = targetables.reactComponent(
        '@magento/venia-ui/lib/components/CheckoutPage/PaymentInformation/paymentMethods.js'
    );

    PaymentRadioGroup.addImport('import IconsList from "@worldline/worldline-payment/src/components/IconsList";');
    PaymentMethod.addImport('import customClasses from \'@worldline/worldline-payment/src/components/PaymentInformation/paymentMethods.module.css\';');

    PaymentRadioGroup.insertAfterSource(
        '<span className={classes.label}>',
        `
            {
                value
                && value.indexOf('worldline_redirect_payment') !== -1
                && <IconsList code={value} />
            }
        `
    );

    PaymentRadioGroup.insertBeforeSource(
        '</label>',
        `
            {
                value
                && (value.indexOf('worldline_hosted_checkout') !== -1 || value.indexOf('worldline_cc') !== -1)
                && <IconsList code={value} use_additional_classes={true} />
            }
        `
    );

    PaymentMethod.insertAfterSource(
        'const classes = useStyle(defaultClasses, propClasses);',
        `
            const customClassesStyles = useStyle(customClasses, propClasses);
        `
    );

    PaymentMethod.setJSXProps(
        `Radio`,
        {
            classes: '{{label: customClassesStyles.radio_label}}'
        }
    )
};
