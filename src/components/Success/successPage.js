import React, { useEffect } from 'react';
import {Link, useHistory} from 'react-router-dom';
import useSuccess from '@worldline/worldline-payment/src/talons/Success/useSuccess';
import { useStyle } from '@magento/venia-ui/lib/classify';
import OrderConfirmationPage from '@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { FormattedMessage, useIntl } from 'react-intl';
import { useToasts } from '@magento/peregrine';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Info as InfoIcon } from 'react-feather';
import {useMutation} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";
import defaultClasses from './successPage.module.css';
import {StoreTitle} from "@magento/venia-ui/lib/components/Head";
import ItemsReview from "@magento/venia-ui/lib/components/CheckoutPage/ItemsReview";
import resourceUrl from "@magento/peregrine/lib/util/makeUrl";
import Logo from "@magento/venia-ui/lib/components/Logo";

const icon = <Icon src={InfoIcon} size={20} />;
const MULTIBANKO_CODE = 5500;

function getStorageData(key) {
    const storageData = localStorage.getItem(key);

    return typeof storageData === 'undefined' || storageData === 'undefined'
        ? false
        : JSON.parse(storageData);
}

const SuccessPage = (props) => {
    const classes = useStyle(defaultClasses, props.classes);
    const history = useHistory();
    const data = getStorageData('orderDetailsData');
    const orderNumberData = JSON.parse(localStorage.getItem('orderNumber'));
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const {
        status,
        orderIncrementId,
        methodCode,
        paymentProductId,
        processResultSent,
        pendingOrderCalled,
        loading,
        createCartMutation,
        isMultibanko
    } = useSuccess();

    const [fetchCartId] = useMutation(createCartMutation);
    const [{ cartId }, { createCart, removeCart }] = useCartContext();
    const orderNumber = orderIncrementId || orderNumberData;

    const showMultibankoMessage = isMultibanko || (paymentProductId === MULTIBANKO_CODE);

    useEffect(() => {
        if (!showMultibankoMessage && status === 'fail') {
            if (pendingOrderCalled) {
                removeCart();
                createCart({
                    fetchCartId
                });

                const message = formatMessage({
                    id: 'successPage.errorSubmit',
                    defaultMessage: `Thank you for your order ${orderNumber}. `
                        + `Your order is still being processed and you will receive a confirmation e-mail. `
                        + `Please contact us in case you don’t receive the confirmation within 10 minutes.`
                });
                addToast({
                    type: 'info',
                    icon: icon,
                    message,
                    dismissable: true,
                    timeout: 0
                });
            }

            history.push('/cart');
        }
    }, [addToast, status, formatMessage]);

    return (
        <>
            {(showMultibankoMessage && data) && (
                <div className={classes.mainContainer}>
                    <h2 data-cy="OrderConfirmationPage-header" className={classes.heading}>
                        <FormattedMessage
                            id={'checkoutPage.processedPayment'}
                            defaultMessage={'Your payment is being processed'}
                        />
                    </h2>
                    <div data-cy="OrderConfirmationPage-orderNumber">
                        <FormattedMessage
                            id={'checkoutPage.orderNumberInfo'}
                            defaultMessage={'Thank you for your order {orderNumber}.'}
                            values={{ orderNumber }}
                        />
                    </div>
                    <div data-cy="OrderConfirmationPage-info" >
                        <FormattedMessage
                            id={'checkoutPage.orderNumberMessageLine1'}
                            defaultMessage={'Your order is still being processed and you will receive a confirmation e-mail.'}
                        /><br/>
                        <FormattedMessage
                            id={'checkoutPage.orderNumberMessageLine2'}
                            defaultMessage={'Please go to an ATM to validate the Multibanco payment.'}
                        />
                    </div>
                    <Link
                        to={resourceUrl('/')}
                        aria-label={'Continue Shopping'}
                    >
                        <FormattedMessage
                            id={'checkoutPage.continueShopping'}
                            defaultMessage={'Continue Shopping'}
                        />
                    </Link>
                </div>
            )}

            {(!showMultibankoMessage && !processResultSent || loading) && (
                <LoadingIndicator>
                    <FormattedMessage
                        id={'successPage.loadingOrderInformation'}
                        defaultMessage={'Loading...'}
                    />
                </LoadingIndicator>
            )}

            {!showMultibankoMessage && processResultSent && status === 'waiting' && (
                <LoadingIndicator>
                    <FormattedMessage
                        id={'successPage.waitingForPayment'}
                        defaultMessage={
                            'Please, wait. The payment is being processed...'
                        }
                    />
                </LoadingIndicator>
            )}

            {(data && status === 'success' && (
                <OrderConfirmationPage
                    data={data}
                    orderNumber={orderNumber}
                />
            )) || null}
        </>
    );
};

export default SuccessPage;
