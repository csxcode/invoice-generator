import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';
import {InvoiceData} from './types';

export async function generate(data: InvoiceData): Promise<void> {
	const templatePath = path.join(__dirname, './templates/invoice.ejs');
	const template = fs.readFileSync(templatePath, 'utf-8');

	const logoImage = fs.readFileSync(data.assets.logo, 'base64');
	const signatureImage = fs.readFileSync(data.assets.signature, 'base64');

	data.total = data.items.reduce((acc, item) => acc + item.qty * item.value, 0);

	const html = ejs.render(template, {
		data,
		logoImage,
		signatureImage,
		generationDate: new Date().toLocaleDateString(),
	});

	const browser = await puppeteer.launch({
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--disable-gpu',
			'--window-size=1200,800',
		],
		timeout: 30000,
	});

	const page = await browser.newPage();

	// Increase the navigation and timeout limits
	page.setDefaultNavigationTimeout(30000);
	page.setDefaultTimeout(30000);

	await page.setViewport({width: 1200, height: 800});
	await page.setContent(html, {
		waitUntil: ['networkidle0', 'load'],
		timeout: 30000,
	});
	await Promise.all([
		page.waitForSelector('img[alt="Logo"]'),
		page.waitForSelector('img[alt="Signature"]'),
	]);

	const year = new Date().getFullYear();
	const month = new Date().getMonth() + 1;
	const outputPath = path.join(__dirname, `../output/${year}-${month}-BIX.pdf`);

	await page.pdf({
		path: outputPath,
		format: 'A4',
		printBackground: true,
		margin: {
			top: '20px',
			right: '20px',
			bottom: '20px',
			left: '20px',
		},
		timeout: 30000,
	});

	await browser.close();
}
