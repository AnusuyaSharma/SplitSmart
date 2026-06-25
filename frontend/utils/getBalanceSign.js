export const getBalanceSign = (amount) => {
    if (amount > 0) return "+";
    if (amount < 0) return "-";
    return "";
};