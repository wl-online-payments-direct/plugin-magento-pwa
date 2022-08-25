import VI from '../images/vi.png'
import AE from '../images/ae.png'
import DN from '../images/dn.png'
import JCB from '../images/jcb.png'
import MC from '../images/mc.png'
import MD from '../images/md.png'
const cartImages = {
    VI: VI,
    AE: AE,
    DN: DN,
    JCB: JCB,
    MC: MC,
    MD: MD
}

export const cardTypeMapper = {
    AE: 'American Express',
    AU: 'Aura',
    DI: 'Discover',
    DN: 'Diners',
    ELO: 'Elo',
    HC: 'Hipercard',
    JCB: 'JCB',
    MC: 'MasterCard',
    MD: 'Maestro Domestic',
    MI: 'Maestro International',
    UN: 'UnionPay',
    VI: 'Visa'
};

export const paymentMethods = {
    CC: {
        query: 'processCCResult',
        code: [ 'worldline_cc', 'worldline_cc_vault' ]
    },
    HC: {
        query: 'processHCResult',
        code: [ 'worldline_hosted_checkout', 'worldline_hosted_checkout_vault' ]
    }
}

export const getCardImages = type => {
    return cartImages[type.toUpperCase()] && cartImages[type.toUpperCase()] || null;
}
