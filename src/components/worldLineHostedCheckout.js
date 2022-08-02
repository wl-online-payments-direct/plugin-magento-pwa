import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { shape, string, bool, func } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useWorldLineHostedCheckout } from "@worldline/worldline-payment/src/talons/useWorldLineHostedCheckout";
import defaultClasses from './worldline.module.css'
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';
import IconsList from "./iconsList";


const WorldLineHostedCheckout = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const {
        isLoading,
        errorScriptLoading,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess} = useWorldLineHostedCheckout(props);

    return (
        <div className={classes.hostedCheckout}>
            <IconsList code={'worldline_hosted_checkout'} />
            {!isLoading && !errorScriptLoading && (
                <BillingAddress
                    resetShouldSubmit={props.resetShouldSubmit}
                    shouldSubmit={props.shouldSubmit}
                    onBillingAddressChangedError={onBillingAddressChangedError}
                    onBillingAddressChangedSuccess={onBillingAddressChangedSuccess}
                />
            )}
            { !isLoading && errorScriptLoading &&
            <div className={classes.errorMessages}>
                <FormattedMessage
                    id={'checkoutPage.paymentLoadingError'}
                />
            </div>
            }
        </div>
    );
};

WorldLineHostedCheckout.propTypes = {
    classes: shape({ root: string }),
    payableTo: string,
    mailingAddress: string,
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onPaymentReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};

WorldLineHostedCheckout.defaultProps = {
    payableTo: 'Venia Inc',
    mailingAddress: 'Venia Inc\r\nc/o Payment\r\nPO 122334\r\nAustin Texas'
};

export default WorldLineHostedCheckout;
