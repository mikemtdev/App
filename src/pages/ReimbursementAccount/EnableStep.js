import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import Icon from '../../components/Icon';
import {Bank, Pencil} from '../../components/Icon/Expensicons';
import colors from '../../styles/colors';
import variables from '../../styles/variables';
import MenuItem from '../../components/MenuItem';
import {openSignedInLink} from '../../libs/actions/App';
import getBankIcon from '../../components/Icon/BankIcons';
import {getPaymentMethods} from '../../libs/actions/PaymentMethods';
import FullScreenLoadingIndicator from '../../components/FullscreenLoadingIndicator';

const propTypes = {
    ...withLocalizePropTypes,
};

class EnableStep extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoadingPaymentMethods: true,
        };
    }

    componentDidMount() {
        getPaymentMethods().then(() => {
            this.setState({isLoadingPaymentMethods: false});
        });
    }

    render() {
        if (this.state.isLoadingPaymentMethods) {
            return (
                <FullScreenLoadingIndicator visible />
            );
        }

        const {
            user, reimbursementAccount, translate, bankAccountList,
        } = this.props;
        const isUsingExpensifyCard = user.isUsingExpensifyCard;
        const account = _.find(bankAccountList, bankAccount => bankAccount.bankAccountID === reimbursementAccount.achData.bankAccountID);
        if (!account) {
            throw new Error('Account not found in EnableStep');
        }

        const {icon} = getBankIcon(account.additionalData.bankName);
        const formattedBankAccountNumber = account.accountNumber
            ? `${translate('paymentMethodList.accountLastFour')} ${
                account.accountNumber.slice(-4)
            }`
            : '';
        const bankName = account.addressName;
        return (
            <View style={[styles.flex1, styles.justifyContentBetween]}>
                <HeaderWithCloseButton
                    title={translate('workspace.common.bankAccount')}
                    onCloseButtonPress={Navigation.dismissModal}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.flex1]}>
                    <View style={[styles.mh5, styles.mb5, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                        <Text style={[styles.textLarge, styles.textStrong]}>{!isUsingExpensifyCard ? 'Basically done!' : 'All set!'}</Text>
                        <Icon src={Bank} fill={colors.yellow} height={variables.componentSizeNormal} width={variables.componentSizeNormal} />
                    </View>
                    <MenuItem
                        title={bankName}
                        description={formattedBankAccountNumber}
                        icon={icon}
                    />
                    <Text style={[styles.mh5, styles.mb5]}>
                        {!isUsingExpensifyCard
                            ? 'This bank account will be used to reimburse expenses, collect invoices, and pay bills all from the same account. To enable the Expensify Card, please add a work email address.'
                            : 'This bank account will be used to issue corporate cards, reimburse expenses, collect invoices, and pay bills all from the same account.'}
                    </Text>
                    {!isUsingExpensifyCard && (
                        <MenuItem
                            title="Add work email"
                            icon={Pencil}
                            onPress={() => {
                                openSignedInLink('settings?param={“section”:”account”,”openModal”:”secondaryLogin”}');
                            }}
                            shouldShowRightIcon
                        />
                    )}
                </View>
            </View>
        );
    }
}

EnableStep.propTypes = propTypes;
EnableStep.displayName = 'EnableStep';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        reimbursementAccount: {
            key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
        },
        bankAccountList: {
            key: ONYXKEYS.BANK_ACCOUNT_LIST,
        },
    }),
)(EnableStep);
