import { useQuery } from '@apollo/client';
import mergeOperations from '@magento/peregrine/lib/util/shallowMerge';
import DEFAULT_OPERATIONS from './worldLine.gql';

export const useWorldLineConfig = props => {
    const operations = mergeOperations(DEFAULT_OPERATIONS);
    const { getConfigWorldLine } = operations;
    const { data: worldLineConfig, loading } = useQuery(getConfigWorldLine,{
        fetchPolicy: 'no-cache'
    });

    return {
        loading,
        config: worldLineConfig
    };
};

