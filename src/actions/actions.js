'use server';
import prisma from "@/lib/prisma";

//customer
export async function customerGetAll() {
    return await prisma.customer.findMany({
        orderBy: {
            customerName: 'asc'
        }
    });
}
export async function customerGetAllById() {
    return await prisma.customer.findMany({
        orderBy: {
            id: 'asc'
        }
    });
}
export async function customerGetByQuotationId(quotationId) {
    const quotation = await prisma.quotation.findUnique({
        where: {
            id: quotationId,
        },
        select: {
            customer: true,
        },
    });

    return quotation?.customer || null;
}
export async function customerCreatePost(customerData) {
    const existing = await prisma.customer.findUnique({
      where: {
        customerName: customerData.name,
      },
    });
  
    if (existing) {
      throw new Error(`Customer with name "${customerData.name}" already exists.`);
    }
  
    return await prisma.customer.create({
      data: {
        customerName: customerData.name,
        address: customerData.address || null,
        phone: customerData.phone || null,
      },
    });
}
export async function customerUpdate(customerId, customerData) {
    await prisma.customer.update({
        where: {
            id: customerId,
        },
        data: {
            customerName: customerData.name,
            address: customerData.address || null,
            phone: customerData.phone || null,
        },
    });
}
export async function customerDelete(customerId) {
    await prisma.customer.deleteMany({
        where: {
            id: customerId,
        },
    });
}
//item
export async function itemGet() {
    return await prisma.item.findMany({
        orderBy: {
            itemName: 'asc'
        }
    });
}
export async function itemGetAll() {
    return await prisma.item.findMany({
        orderBy: {
            id: 'asc'
        }
    });
}
export async function itemCreatePost(itemData) {
    await prisma.item.create({
        data: {
            itemName: itemData.name,
            description: itemData.description,
            price: itemData.price,
        }
    });
}
export async function itemUpdate(itemId, itemData) {
    await prisma.item.update({
        where: {
            id: itemId,
        },
        data: {
            itemName: itemData.name,
            description: itemData.description,
            Unit: itemData.unit
        },
    });
}
export async function itemDelete(itemId) {
    await prisma.item.deleteMany({
        where: {
          id: itemId,
        },
    });
}
//quotation
export async function quotationGet(quotationId) {
    const quotation = await prisma.quotation.findUnique({
        where: {
            id: quotationId,
        },
        include: {
            customer: true,
            invoice: true,
            QuotationItems: {
                include: {
                    item: true
                }
            }
        },
    });
    if (!quotation) return null;
    return {
        ...quotation,
        invoice: quotation.invoice ? {
            ...quotation.invoice,
            amount: Number(quotation.invoice.amount),
            amountPaid: Number(quotation.invoice.amountPaid),
            amountDue: Number(quotation.invoice.amountDue),
        } : null,
        QuotationItems: quotation.QuotationItems.map(qItem => ({
            ...qItem,
            price: Number(qItem.price),
            item: {
                ...qItem.item,
                price: Number(qItem.item.price)
            }
        }))
    };
}
export async function quotationGetByInvoiceId(invoiceId){
    const invoice = await prisma.invoice.findUnique({
        where: {
            id: invoiceId,
        },
        include: {
            quotation: {
                include: {
                    customer: true,
                    QuotationItems: {
                        include: { item: true }
                    }
                }
            }
        }
    });
    if (!invoice || !invoice.quotation) return null;
    const quotation = invoice.quotation;
    return {
        ...quotation,
        QuotationItems: quotation.QuotationItems.map(qItem => ({
            ...qItem,
            price: Number(qItem.price),
            item: {
                ...qItem.item,
                price: Number(qItem.item.price)
            }
        }))
    };
}
export async function quotationGetAll(){
    const quotations = await prisma.quotation.findMany({
        include: {
            customer: true,
            invoice: true,
            QuotationItems: {
                include: {
                    item: true
                }
            }
        }
    });

    return quotations.map((quotation) => ({
        ...quotation,
        invoice: quotation.invoice ? {
            ...quotation.invoice,
            amount: Number(quotation.invoice.amount),
            amountPaid: Number(quotation.invoice.amountPaid),
            amountDue: Number(quotation.invoice.amountDue),
        } : null,
        QuotationItems: quotation.QuotationItems.map((item) => ({
            ...item,
            price: Number(item.price),
            item: {
                ...item.item,
                price: Number(item.item.price)
            }
        }))
    }));
}
export async function quotationGetAllDefault() {
    const quotations = await prisma.quotation.findMany({
        where: {
            AND: [
                { quotationStatus: { not: "Rejected" } },
                { customerStatus: { not: "Approved" } },
                { customerStatus: { not: "Rejected" } }
            ]
        },
        include: {
            customer: true,
            invoice: true,
            QuotationItems: {
                include: {
                    item: true
                }
            }
        }
    });

    return quotations.map((quotation) => ({
        ...quotation,
        invoice: quotation.invoice ? {
            ...quotation.invoice,
            amount: quotation.invoice.amount.toNumber(),
            amountPaid: quotation.invoice.amountPaid.toNumber(),
            amountDue: quotation.invoice.amountDue.toNumber(),
        } : null,
        QuotationItems: quotation.QuotationItems.map((item) => ({
            ...item,
            price: item.price.toNumber(),
        }))
    }));
}
export async function quotationGetAllCustom(quoteStatus, cusStatus) {
    const quotations = await prisma.quotation.findMany({
        where: {
            OR: [
                quoteStatus ? { quotationStatus: quoteStatus } : {},
                cusStatus ? { customerStatus: cusStatus } : {}
            ]
        },
        include: {
            customer: true,
            invoice: true,
            QuotationItems: {
                include: {
                    item: true
                }
            }
        }
    });

    return quotations.map((quotation) => ({
        ...quotation,
        invoice: quotation.invoice ? {
            ...quotation.invoice,
            amount: Number(quotation.invoice.amount),
            amountPaid: Number(quotation.invoice.amountPaid),
            amountDue: Number(quotation.invoice.amountDue),
        } : null,
        QuotationItems: quotation.QuotationItems.map((item) => ({
            ...item,
            price: Number(item.price),
            item: {
                ...item.item,
                price: Number(item.item.price)
            }
        }))
    }));
}
export async function quotationGetAllNull() {
    const quotations = await prisma.quotation.findMany({
        where: {
            invoice: null
        },
        include: {
            customer: true,
            invoice: true,
            QuotationItems: {
                include: {
                    item: true
                }
            }
        }
    });

    return quotations.map((quotation) => ({
        ...quotation,
        invoice: quotation.invoice ? {
            ...quotation.invoice,
            amount: Number(quotation.invoice.amount),
            amountPaid: Number(quotation.invoice.amountPaid),
            amountDue: Number(quotation.invoice.amountDue),
        } : null,
        QuotationItems: quotation.QuotationItems.map((item) => ({
            ...item,
            price: Number(item.price),
            item: {
                ...item.item,
                price: Number(item.item.price)
            }
        }))
    }));
}
export async function quotationCreatePost(Data) {
    const quotation = await prisma.quotation.create({
        data: {
            date: Data.date,
            quotationStatus: Data.quotationStatus,
            customerStatus: Data.customerStatus,
            customerid: Data.customerId,
            invoiceid: Data.invoiceId,
        },
    });
    return quotation;
}
export async function quotationUpdate(quotationId, Data) {
    await prisma.quotation.update({
        where: {
            id: quotationId,
        },
        data: {
            date: Data.date,
            quotationStatus: Data.quotationStatus,
            customerStatus: Data.customerStatus,
            customerid: Data.customerId,
            invoiceid: Data.invoiceId,
        },
    });
}
export async function quotationDelete(quotationId) {
    await prisma.quotation.deleteMany({
        where: {
            id: quotationId,
        },
    });
}
//quotationItem
export async function quotationItemCreatePost(Data) {
    await prisma.quotationItem.create({
        data: {
            remark: Data.remark,
            quantity: Data.quantity,
            price: Data.price,
            quotation: { connect: { id: Data.quotationId } },
            item: { connect: { id: Data.itemId } }   
        } 
    });
}
export async function quotationItemUpdatePost(quotationItemId, Data) {
    await prisma.quotationItem.update({
        where: {
            id: quotationItemId,
        },
        data: {
            remark: Data.remark,
            quantity: Data.quantity,
            price: Data.price,
            quotation: { connect: { id: Data.quotationId } },
            item: { connect: { id: Data.itemId } }
        },
    });
}
export async function quotationItemDelete(quotationItemId) {
    await prisma.quotationItem.deleteMany({
        where: {
            id: quotationItemId,
        },
    });
}
//invoice
export async function invoiceGet(invoiceId) {
    const invoiceOne = await prisma.invoice.findUnique({
        where: {
            id: invoiceId
        },
        include: {
            customer: true,
            quotation: {
                include: {
                    QuotationItems: {
                        include: {
                            item: true
                        }
                    }
                }
            }
        },
    });

    if (!invoiceOne) return null;

    return {
        ...invoiceOne,
        amount: invoiceOne.amount.toNumber(),
        amountPaid: invoiceOne.amountPaid.toNumber(),
        amountDue: invoiceOne.amountDue.toNumber(),
        quotation: invoiceOne.quotation ? {
            ...invoiceOne.quotation,
            QuotationItems: invoiceOne.quotation.QuotationItems.map(qItem => ({
                ...qItem,
                price: qItem.price.toNumber(),
            }))
        } : null
    };
}
export async function invoiceGetAll() {
    const invoices = await prisma.invoice.findMany({
        include: {
            customer: true,
            quotation: {
                include: {
                    QuotationItems: {
                        include: {
                            item: true
                        }
                    }
                }
            }
        },
    });

    if (!invoices) return null;

    return invoices.map(invoice => ({
        ...invoice,
        amount: invoice.amount.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        quotation: invoice.quotation ? {
            ...invoice.quotation,
            QuotationItems: invoice.quotation.QuotationItems.map(qItem => ({
                ...qItem,
                price: qItem.price.toNumber(),
            }))
        } : null,
    }));
}
export async function invoiceGetAllDefault() {
    const invoices = await prisma.invoice.findMany({
        where: {
            invoiceStatus: {
                not: "Paid"
            }
        },
        include: {
            customer: true,
            quotation: {
                include: {
                    QuotationItems: {
                        include: {
                            item: true
                        }
                    }
                }
            }
        },
    });

    if (!invoices) return null;

    return invoices.map(invoice => ({
        ...invoice,
        amount: invoice.amount.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        quotation: invoice.quotation ? {
            ...invoice.quotation,
            QuotationItems: invoice.quotation.QuotationItems.map(qItem => ({
                ...qItem,
                price: qItem.price.toNumber(),
            }))
        } : null,
    }));
}
export async function invoiceGetAllCustom(invoiceStat) {
    const invoices = await prisma.invoice.findMany({
        where: {
            invoiceStatus: invoiceStat
        },
        include: {
            customer: true,
            quotation: {
                include: {
                    QuotationItems: {
                        include: {
                            item: true
                        }
                    }
                }
            }
        },
    });

    if (!invoices) return null;

    return invoices.map(invoice => ({
        ...invoice,
        amount: invoice.amount.toNumber(),
        amountPaid: invoice.amountPaid.toNumber(),
        amountDue: invoice.amountDue.toNumber(),
        quotation: invoice.quotation ? {
            ...invoice.quotation,
            QuotationItems: invoice.quotation.QuotationItems.map(qItem => ({
                ...qItem,
                price: qItem.price.toNumber(),
            }))
        } : null,
    }));
}
export async function invoiceCreatePost(Data){
    const invoice = await prisma.invoice.create({
        data: {
            date: Data.date,
            dueDate: Data.dueDate,
            amount: Data.amount,
            amountDue: Data.amountDue,
            amountPaid: Data.amountPaid,
            invoiceStatus: Data.invoiceStatus,
            customer: Data.customerId ? { connect: { id: Data.customerId } } : undefined,
            quotation: Data.quotationId ? { connect: { id: Data.quotationId } } : undefined,
        },
    });
    return invoice;
}
export async function invoiceUpdate(invoiceId, Data){
    await prisma.invoice.update({
        where: {
            id: invoiceId,
        },
        data: {
            date: Data.date,
            dueDate: Data.dueDate,
            amount: Data.amount,
            amountPaid: Data.amountPaid,
            amountDue: Data.amountDue,
            invoiceStatus: Data.invoiceStatus,
            customer: { connect: {id: Data.customerId}},
            quotation: { connect: {id: Data.quotationId}},
        },
    });
}
export async function invoiceDelete(invoiceId) {
    await prisma.invoice.deleteMany({
        where: {
            id: invoiceId,
        },
    });
}