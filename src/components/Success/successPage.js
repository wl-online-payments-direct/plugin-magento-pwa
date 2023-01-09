import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useSuccess from '@worldline/worldline-payment/src/talons/Success/useSuccess';
import OrderConfirmationPage from '@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage';
import LoadingIndicator from '@magento/venia-ui/lib/components/LoadingIndicator';
import { FormattedMessage, useIntl } from 'react-intl';
import { useToasts } from '@magento/peregrine';
import Icon from '@magento/venia-ui/lib/components/Icon';
import { Info as InfoIcon } from 'react-feather';
import {useMutation} from "@apollo/client";
import {useCartContext} from "@magento/peregrine/lib/context/cart";

const icon = <Icon src={InfoIcon} size={20} />;

function getStorageData(key) {
    const storageData = localStorage.getItem(key);

    return typeof storageData === 'undefined' || storageData === 'undefined'
        ? false
        : JSON.parse(storageData);
}

const SuccessPage = () => {
    const history = useHistory();
    const data = getStorageData('orderDetailsData');
    const orderNumber = JSON.parse(localStorage.getItem('orderNumber'));
    const [, { addToast }] = useToasts();
    const { formatMessage } = useIntl();
    const {
        status,
        orderIncrementId,
        processResultSent,
        pendingOrderCalled,
        loading,
        createCartMutation
    } = useSuccess();

    const [fetchCartId] = useMutation(createCartMutation);
    const [{ cartId }, { createCart, removeCart }] = useCartContext();

    useEffect(() => {
        if (status === 'fail') {
            if (pendingOrderCalled) {
                removeCart();
                createCart({
                    fetchCartId
                });

                const message = formatMessage({
                    id: 'successPage.errorSubmit',
                    defaultMessage: `Thank you for your order ${orderIncrementId || orderNumber}. `
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
            {(!processResultSent || loading) && (
                <LoadingIndicator>
                    <FormattedMessage
                        id={'successPage.loadingOrderInformation'}
                        defaultMessage={'Loading...'}
                    />
                </LoadingIndicator>
            )}

            {processResultSent && status === 'waiting' && (
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
                    orderNumber={orderIncrementId || orderNumber}
                />
            )) || null}
        </>
    );
};

export default SuccessPage;
