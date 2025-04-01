import {generate} from './generate';
import fs from 'fs';
import path from 'path';

const jsonPath = path.join(__dirname, '../data/invoice.json');
const jsonData = fs.readFileSync(jsonPath, 'utf-8');
const invoiceData = JSON.parse(jsonData);

generate(invoiceData)
	.then(() => {
		console.log('Invoice PDF generated successfully.');
	})
	.catch((error: Error) => {
		console.error('Error generating invoice:', error);
	});
