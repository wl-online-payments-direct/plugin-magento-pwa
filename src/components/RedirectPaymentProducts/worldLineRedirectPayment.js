import React from 'react';
import { useStyle } from '@magento/venia-ui/lib/classify';
import { shape, string, bool, func } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { useWorldLineRedirectPayment } from '@worldline/worldline-payment/src/talons/useWorldLineRedirectPayment';
import defaultClasses from './worldLineRedirectPayment.module.css';
import BillingAddress from '@magento/venia-ui/lib/components/CheckoutPage/BillingAddress';

const WorldLineRedirectPayment = props => {
    const classes = useStyle(defaultClasses, props.classes);
    const { paymentCode } = props;
    const {
        isLoading,
        errorScriptLoading,
        onBillingAddressChangedError,
        onBillingAddressChangedSuccess
    } = useWorldLineRedirectPayment(props);

    return (
        <div className={classes.redirectPayment}>
            {!isLoading && !errorScriptLoading && (
                <BillingAddress
                    resetShouldSubmit={props.resetShouldSubmit}
                    shouldSubmit={props.shouldSubmit}
                    onBillingAddressChangedError={onBillingAddressChangedError}
                    onBillingAddressChangedSuccess={
                        onBillingAddressChangedSuccess
                    }
                />
            )}
            {!isLoading && errorScriptLoading && (
                <div className={classes.errorMessages}>
                    <FormattedMessage id={'checkoutPage.paymentLoadingError'} />
                </div>
            )}
        </div>
    );
};

WorldLineRedirectPayment.propTypes = {
    classes: shape({ root: string }),
    payableTo: string,
    mailingAddress: string,
    shouldSubmit: bool.isRequired,
    onPaymentSuccess: func,
    onPaymentReady: func,
    onPaymentError: func,
    resetShouldSubmit: func.isRequired
};

WorldLineRedirectPayment.defaultProps = {
    payableTo: 'Venia Inc',
    mailingAddress: 'Venia Inc\r\nc/o Payment\r\nPO 122334\r\nAustin Texas'
};

export default WorldLineRedirectPayment;
