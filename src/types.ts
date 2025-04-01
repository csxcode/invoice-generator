export interface InvoiceItem {
	description: string;
	qty: number;
	value: string;
	total: string;
}

export interface InvoiceData {
	assets: {logo: string; signature: string};
	header: {title: string};
	items: InvoiceItem[];
	sender: {name: string; identityDocument: string};
	total: string;
}
