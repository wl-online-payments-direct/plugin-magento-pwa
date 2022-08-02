import React, { useEffect } from "react";
import { useHistory } from 'react-router-dom';
import useSuccess from "@worldline/worldline-payment/src/talons/Success/useSuccess";
import OrderConfirmationPage from "@magento/venia-ui/lib/components/CheckoutPage/OrderConfirmationPage";

const SuccessPage = (props) => {
    const history = useHistory();
    const data = JSON.parse(localStorage.getItem('orderDetailsData'));
    const orderNumber = JSON.parse(localStorage.getItem('orderNumber'));
    const { result, orderIncrementId } = useSuccess();

    useEffect(()=>{
        if (result === 'fail') {
            history.push('/cart')
        }
    },[result]);

    return (
        data && ( <OrderConfirmationPage data={data} orderNumber={orderIncrementId || orderNumber} /> ) || null
    );
};

export default SuccessPage;
