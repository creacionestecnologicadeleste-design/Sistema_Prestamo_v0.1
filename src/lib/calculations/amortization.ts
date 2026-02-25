export interface AmortizationRow {
    installmentNumber: number;
    dueDate: Date;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    remainingBalance: number;
}

export interface CalculationParams {
    amount: number;
    annualInterestRate: number;
    termMonths: number;
    startDate: Date;
}

/**
 * Calculates amortization schedule using the French method (Fixed Installments)
 */
export function calculateFrenchAmortization(params: CalculationParams): AmortizationRow[] {
    const { amount, annualInterestRate, termMonths, startDate } = params;
    const monthlyRate = annualInterestRate / 100 / 12;

    // Formula: C = P * [r(1+r)^n] / [(1+r)^n - 1]
    const installment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);

    const schedule: AmortizationRow[] = [];
    let currentBalance = amount;

    for (let i = 1; i <= termMonths; i++) {
        const interest = currentBalance * monthlyRate;
        const principal = installment - interest;
        currentBalance -= principal;

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedule.push({
            installmentNumber: i,
            dueDate,
            principalAmount: Number(principal.toFixed(2)),
            interestAmount: Number(interest.toFixed(2)),
            totalAmount: Number(installment.toFixed(2)),
            remainingBalance: Number(Math.max(0, currentBalance).toFixed(2)),
        });
    }

    return schedule;
}

/**
 * Calculates amortization schedule using the German method (Fixed Principal)
 */
export function calculateGermanAmortization(params: CalculationParams): AmortizationRow[] {
    const { amount, annualInterestRate, termMonths, startDate } = params;
    const monthlyRate = annualInterestRate / 100 / 12;

    const principalPerInstallment = amount / termMonths;

    const schedule: AmortizationRow[] = [];
    let currentBalance = amount;

    for (let i = 1; i <= termMonths; i++) {
        const interest = currentBalance * monthlyRate;
        const installment = principalPerInstallment + interest;
        currentBalance -= principalPerInstallment;

        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedule.push({
            installmentNumber: i,
            dueDate,
            principalAmount: Number(principalPerInstallment.toFixed(2)),
            interestAmount: Number(interest.toFixed(2)),
            totalAmount: Number(installment.toFixed(2)),
            remainingBalance: Number(Math.max(0, currentBalance).toFixed(2)),
        });
    }

    return schedule;
}
