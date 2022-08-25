import React, { useEffect } from "react";
import { useHistory } from 'react-router-dom';
import useSuccess from "@worldline/worldline-payment/src/talons/Success/useSuccess";
import OrderConfirmationPage from "@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage";
import LoadingIndicator from "@magento/venia-ui/lib/components/LoadingIndicator";
import {FormattedMessage} from "react-intl";

function getStorageData(key) {
    const storageData = localStorage.getItem(key);

    return (typeof storageData === 'undefined' || storageData === 'undefined') ? false : JSON.parse(storageData);
}

const SuccessPage = () => {
    const history = useHistory();
    const data = getStorageData('orderDetailsData');
    const orderNumber = JSON.parse(localStorage.getItem('orderNumber'));
    const { result, orderIncrementId, sendedRequest, loading } = useSuccess();

    useEffect(() => {
        if (result === 'fail') {
            history.push('/cart');
        }
    },[result]);

    return (
        <>
            {(!sendedRequest || loading) && (
                <LoadingIndicator>
                    <FormattedMessage
                        id={'successPage.loadingOrderInformation'}
                        defaultMessage={'Fetching Order Information'}
                    />
                </LoadingIndicator>
            )}

            {(data && result === 'success') && (
                <OrderConfirmationPage data={data} orderNumber={orderIncrementId || orderNumber} />
            ) || null}
        </>
    );
};

export default SuccessPage;
