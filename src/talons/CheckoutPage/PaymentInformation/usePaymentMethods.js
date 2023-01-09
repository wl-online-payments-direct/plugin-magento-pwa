const wrapUsePaymentMethods = (original) => {
    return function usePaymentMethods(...args) {
        const {
            ...restProps
        } = original(...args);

        const handlePaymentMethodSelection = () => {
            return null;
        };

        return {
            ...restProps,
            handlePaymentMethodSelection: handlePaymentMethodSelection
        };
    };
};

export default wrapUsePaymentMethods;
