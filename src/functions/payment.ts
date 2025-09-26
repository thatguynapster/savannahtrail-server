import axios from "axios";

interface PaystackSuccessResponse<T> {
    status: true,
    message: string,
    data: T
}

interface PaystackErrorResponse {
    status: false,
    message: string,
    meta?: {
        nextStep: string
    }
    type?: string
    code?: string
    data?: null
}

export class Paystack {

    bearer_token: string = ""
    subaccount: string | null = null

    private request = axios.create({
        baseURL: 'https://api.paystack.co',
        headers: {
            'Content-Type': 'application/json',

        },
        validateStatus: (status) => status < 500
    });

    constructor(bearer_token: string, subaccount = null) {
        this.bearer_token = bearer_token;
        this.subaccount = subaccount;

        this.request.defaults.baseURL = 'https://api.paystack.co';
        this.request.defaults.headers.Authorization = `Bearer ${this.bearer_token}`;

    }


    transactions = {
        initialize: async (option: {
            currency?: string,
            amount: number,
            email: string,
            reference: string,
            callback_url: string
            channels?: string,
        }): Promise<PaystackSuccessResponse<{
            authorization_url: string,
            access_code: string,
            reference: string
        }> | PaystackErrorResponse> => {
            try {
                const { currency = "GHS", amount, email, reference, channels = ["mobile_money", "card", "bank_transfer"] } = option;
                const { callback_url } = option;

                const { data, status } = await this.request.post(
                    "/transaction/initialize",
                    {
                        currency,
                        amount: amount * 100,
                        email,
                        reference,
                        callback_url,
                        channels,
                        meta: {
                            // Maybe add agency id
                        }
                    }
                )

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                const e = new Error(error.message);
                e.name = "PaymentError"
                throw e;
            }
        },
        verify: async (reference: string): Promise<PaystackSuccessResponse<{
            status: string,
            amount: number,
            reference: string,
            gateway_response: string,
            paid_at: string,
            channel: string,
            currency: string,
            id: string
        }> | PaystackErrorResponse> => {
            try {
                const { data, status } = await this.request.get(`/transaction/verify/${reference}`);

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        list: async (option: {
            page?: number,
            per_page?: number,
            status?: 'failed' | 'success' | 'abandoned',
            from?: string,
            to?: string
        }) => {
            try {
                const { page = 1, per_page = 20, status = null, from, to } = option;

                const { data, status: statusCode } = await this.request.get(`/transaction`, {
                    params: {
                        page,
                        per_page,
                        status,
                        from,
                        to
                    }
                });

                if (statusCode !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        fetch: async (id: string) => {
            try {
                const { data, status } = await this.request.get(`/transaction/${id}`);

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        }
    }

    transaction_split = {

    }

    customers = {
        create: async (option: {
            first_name: string,
            last_name: string,
            email: string,
            phone: string,
            type?: 'customer' | 'rider'
        }) => {
            try {
                const { first_name, last_name, email, phone, type = null } = option;

                const { data, status } = await this.request.post("/customer", {
                    first_name,
                    last_name,
                    email,
                    phone
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        list: async (option: {
            page?: number,
            per_page?: number,
            from?: string,
            to?: string
        }) => {
            try {
                const { page = 1, per_page = 20, from, to } = option;

                const { data, status } = await this.request.get("/customer", {
                    params: {
                        page,
                        per_page,
                        from,
                        to
                    }
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        fetch: async (id: string) => {
            try {
                const { data, status } = await this.request.get(`/customer/${id}`);

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        update: async (id: string, option: {
            first_name?: string,
            last_name?: string,
            email?: string,
            phone?: string
        }) => {
            try {
                const { first_name, last_name, email, phone } = option;

                const { data, status } = await this.request.put(`/customer/${id}`, {
                    first_name,
                    last_name,
                    email,
                    phone
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        validate: async (id_email: string, option: {
            first_name: string,
            middle_name: string,
            last_name: string,
            type: "bank_account",
            value: string,
            country: string,
            bvn: string
            bank_code: string
            account_number: string
        }) => {
            try {
                const { first_name, middle_name, last_name, type, value, country, bvn, bank_code, account_number } = option;

                const { data, status } = await this.request.post(`/customer/${id_email}/identification`, {
                    first_name,
                    middle_name,
                    last_name,
                    type,
                    value,
                    country,
                    bvn,
                    bank_code,
                    account_number
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        white_list: async (id_email: string) => {
            try {
                const { data, status } = await this.request.post(`/customer/set_risk_action`, {
                    customer: id_email,
                    risk_action: "allow"
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        black_list: async (id_email: string) => {
            try {
                const { data, status } = await this.request.post(`/customer/set_risk_action`, {
                    customer: id_email,
                    risk_action: "deny"
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        }
    }

    transfer_recipients = {
        create: async (option: {
            type: "nuban" | "ghipss" | "mobile_money" | "basa"
            name: string,
            account_number: string,
            bank_code: string,
            currency: string,
            description: string
            authorization_code?: string
        }) => {
            try {
                const { type, name, account_number, bank_code, currency, description } = option;

                const { data, status } = await this.request.post("/transferrecipient", {
                    type,
                    name,
                    account_number,
                    bank_code,
                    currency,
                    description
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        list: async (option: {
            page?: number,
            per_page?: number,
            from?: string,
            to?: string
        }) => {
            try {
                const { page = 1, per_page = 20, from, to } = option;

                const { data, status } = await this.request.get("/transferrecipient", {
                    params: {
                        page,
                        per_page,
                        from,
                        to
                    }
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        fetch: async (id: string) => {
            try {
                const { data, status } = await this.request.get(`/transferrecipient/${id}`);

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        }
    }

    transfer = {
        initialize: async (option: {
            source: "balance",
            amount: number,
            recipient: string,
            reason: string
            currency?: string,
            reference: string
        }) => {
            try {

                const { source, amount, recipient, reason, currency = "GHS", reference } = option;

                const { data, status } = await this.request.post("/transfer", {
                    source,
                    amount: amount * 100,
                    recipient,
                    reason,
                    currency,
                    reference
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        list: async (option: {
            page?: number,
            per_page?: number,
            status?: 'failed' | 'success' | 'abandoned',
            from?: string,
            to?: string
        }) => {
            try {
                const { page = 1, per_page = 20, status = null, from, to } = option;

                const { data, status: statusCode } = await this.request.get("/transfer", {
                    params: {
                        page,
                        per_page,
                        status,
                        from,
                        to
                    }
                });

                if (statusCode !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        fetch: async (id: string) => {
            try {
                const { data, status } = await this.request.get(`/transfer/${id}`);

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        }
    }

    miscellaneous = {
        list_banks: async (options: {
            country?: string,
            page?: number,
            per_page?: number
        }) => {
            try {
                const { country = "ghana", page = 1, per_page = 20 } = options;

                const { data, status } = await this.request.get("/bank", {
                    params: {
                        country,
                        page,
                        per_page
                    }
                });

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        },
        list_countries: async () => {
            try {
                const { data, status } = await this.request.get("/country");

                if (status !== 200) {
                    throw data;
                }

                return data;
            } catch (error) {
                throw error;
            }
        }
    }

}