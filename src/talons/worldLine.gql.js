import { gql }  from '@apollo/client';
import {AvailablePaymentMethodsFragment} from "@magento/peregrine/lib/talons/CheckoutPage/PaymentInformation/paymentInformation.gql";
import {OrderConfirmationPageFragment} from "@magento/peregrine/lib/talons/CheckoutPage/OrderConfirmationPage/orderConfirmationPageFragments.gql";

export const GET_WORLLINE_CONFIG_DATA = gql`
    query getWorldlineConfig {
        getWorldlineConfig {
            url
        }
        storeConfig {
            worldline_cc_vault_active
        }
    }
`;

export const SET_PAYMENT_METHOD_ON_CART = gql`
    mutation setPaymentMethodOnCart($cartId: String! $hostedTokenizationId: String, $isActivePaymentTokenEnabler: Boolean!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "worldline_cc", worldline_cc: {hosted_tokenization_id: $hostedTokenizationId, is_active_payment_token_enabler: $isActivePaymentTokenEnabler} } }
        ) {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;
export const SET_PAYMENT_METHOD_VAULT_ON_CART = gql`
    mutation setPaymentMethodOnCart($cartId: String! $hostedTokenizationId: String, $publicHash: String!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "worldline_cc_vault", worldline_cc_vault: {hosted_tokenization_id: $hostedTokenizationId, public_hash: $publicHash} } }
        ) {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;
export const SET_PAYMENT_HOSTED_CHECKOUT_VAULT_ON_CART = gql`
    mutation setPaymentMethodOnCart($cartId: String! $publicHash: String!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "worldline_hosted_checkout_vault", worldline_hosted_checkout_vault: {public_hash: $publicHash} } }
        ) {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;
export const SET_PAYMENT_METHOD_HOSTED_CHECKOUT = gql`
    mutation setPaymentMethodOnCart($cartId: String!) {
        setPaymentMethodOnCart(
            input: { cart_id: $cartId, payment_method: { code: "worldline_hosted_checkout"} }
        ) {
            cart {
                id
                selected_payment_method {
                    code
                    title
                }
            }
        }
    }
`;

export const PROCESS_HC_REDIRECT_REQUEST = gql`
    mutation processHCRedirectRequest($cartId: String!) {
        processHCRedirectRequest(
            input: { cart_id: $cartId, payment_method: { code: "worldline_hosted_checkout" } }
        ) {
            redirect_url
        }
    }
`;

export const PROCESS_CC_REDIRECT_REQUEST = gql`
    mutation processCCCreateRequest($cartId: String!) {
        processCCCreateRequest(
            input: { cart_id: $cartId, payment_method: { code: "worldline_cc" } }
        ) {
            redirect_url
        }
    }
`;


export const GET_SAVED_PAYMENTS_QUERY = gql`
    query GetSavedPayments {
        customerPaymentTokens {
            items {
                details
                public_hash
                payment_method_code
                type
                token
            }
        }
    }
`;

export const GET_REDIRECT_URL= gql`
    query checkRedirect($orderID: String!) {
        checkRedirect (incrementId: $orderID) {
            url
        }
    }
`;
export const GET_PROCESS_HOSTED= gql`
    query processHCResult ($paymentId: String!, $mac: String!) {
        processHCResult (paymentId:$paymentId, mac:$mac) {
            result
            orderIncrementId
        }
    }
`;
export const GET_PROCESS_CC= gql`
    query processCCResult ($paymentId: String!, $mac: String!) {
        processCCResult (paymentId:$paymentId, mac:$mac) {
            result
            orderIncrementId
        }
    }
`;

export const GET_CART_PAYMENT_INFORMATION = gql`
    query getPaymentInformation($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...AvailablePaymentMethodsFragment
        }
    }
    ${AvailablePaymentMethodsFragment}
`;

export const GET_ORDER_DETAILS = gql`
    query getOrderDetails($cartId: String!) {
        cart(cart_id: $cartId) {
            id
            ...OrderConfirmationPageFragment
        }
    }
    ${OrderConfirmationPageFragment}
`;

export const CREATE_CART = gql`
    mutation createCart {
        cartId: createEmptyCart
    }
`;

export default {
    getConfigWorldLine: GET_WORLLINE_CONFIG_DATA,
    setPaymentMethodOnCartMutation: SET_PAYMENT_METHOD_ON_CART,
    setPaymentMethodVaultOnCartMutation: SET_PAYMENT_METHOD_VAULT_ON_CART,
    setPaymentHostedCheckoutVaultOnCartMutation: SET_PAYMENT_HOSTED_CHECKOUT_VAULT_ON_CART,
    setPaymentMethodHostedCheckout: SET_PAYMENT_METHOD_HOSTED_CHECKOUT,
    getSavedPaymentMethod: GET_SAVED_PAYMENTS_QUERY,
    getRedirectUrl: GET_REDIRECT_URL,
    processHCResult: GET_PROCESS_HOSTED,
    processCCResult: GET_PROCESS_CC,
    getCartInfo: GET_CART_PAYMENT_INFORMATION,
    getOrderDetailsQuery: GET_ORDER_DETAILS,
    worldlineHCPlaceOrderMutation: PROCESS_HC_REDIRECT_REQUEST,
    worldlineCCPlaceOrderMutation: PROCESS_CC_REDIRECT_REQUEST,
    createCartMutation: CREATE_CART
};
