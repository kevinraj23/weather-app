import { NextResponse } from 'next/server';
import { getRecords } from '@/lib/db';
import { Parser } from 'json2csv';
import { parse } from 'js2xmlparser';
import PDFDocument from 'pdfkit';
import { formatDate, formatNumber } from '@/lib/utils';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';
  const idsParam = searchParams.get('ids');
  
  try {
    let records = getRecords({ limit: 10000 });
    
    // Filter by IDs if provided
    if (idsParam) {
      const ids = idsParam.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      records = records.filter(r => ids.includes(r.id));
    }
    
    // Transform records for export
    const exportData = records.map(record => ({
      id: record.id,
      location: record.location_name,
      latitude: record.latitude,
      longitude: record.longitude,
      date_from: record.date_from,
      date_to: record.date_to,
      temp_min: record.temp_min,
      temp_max: record.temp_max,
      temp_avg: record.temp_avg,
      weather_code: record.weather_code,
      weather_description: record.weather_desc,
      humidity: record.humidity,
      wind_speed: record.wind_speed,
      precipitation: record.precipitation,
      created_at: record.created_at,
      updated_at: record.updated_at,
    }));
    
    const timestamp = new Date().toISOString();
    const filename = `weather_records_export_${formatDate(new Date())}.${format}`;
    
    switch (format.toLowerCase()) {
      case 'json': {
        const jsonOutput = JSON.stringify({
          exported_at: timestamp,
          record_count: exportData.length,
          records: exportData,
        }, null, 2);
        
        return new NextResponse(jsonOutput, {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }
      
      case 'csv': {
        const fields = [
          'id', 'location', 'latitude', 'longitude', 'date_from', 'date_to',
          'temp_min', 'temp_max', 'temp_avg', 'weather_code', 'weather_description',
          'humidity', 'wind_speed', 'precipitation', 'created_at', 'updated_at'
        ];
        
        const parser = new Parser({ fields, header: true });
        const csv = parser.parse(exportData);
        
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }
      
      case 'xml': {
        const xml = parse('weather_records', {
          exported_at: timestamp,
          record_count: exportData.length,
          record: exportData.map(r => ({
            '@': { id: r.id },
            location: r.location,
            latitude: r.latitude,
            longitude: r.longitude,
            date_from: r.date_from,
            date_to: r.date_to,
            temp_min: r.temp_min,
            temp_max: r.temp_max,
            temp_avg: r.temp_avg,
            weather_code: r.weather_code,
            weather_description: r.weather_description,
            humidity: r.humidity,
            wind_speed: r.wind_speed,
            precipitation: r.precipitation,
            created_at: r.created_at,
            updated_at: r.updated_at,
          })),
        }, { declaration: { encoding: 'UTF-8' }, format: { indent: '  ', doubleQuotes: true } });
        
        return new NextResponse(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }
      
      case 'pdf': {
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        
        // Collect PDF chunks
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        
        // Generate PDF content
        generatePDF(doc, exportData, timestamp);
        doc.end();
        
        // Wait for PDF generation
        await new Promise((resolve, reject) => {
          doc.on('end', resolve);
          doc.on('error', reject);
        });
        
        const pdfBuffer = Buffer.concat(chunks);
        
        return new NextResponse(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        });
      }
      
      case 'md':
      case 'markdown': {
        let markdown = `# Weather Records Export\n\n`;
        markdown += `**Exported:** ${new Date(timestamp).toLocaleString()}\n`;
        markdown += `**Record Count:** ${exportData.length}\n\n`;
        
        if (exportData.length === 0) {
          markdown += `*No records found.*\n`;
        } else {
          // Table header
          markdown += `| ID | Location | Lat | Lon | Date From | Date To | Min Temp | Max Temp | Avg Temp | Weather | Humidity | Wind Speed | Precipitation | Created |\n`;
          markdown += `|----|----------|-----|-----|-----------|---------|----------|----------|----------|---------|----------|------------|---------------|---------|\n`;
          
          exportData.forEach(record => {
            markdown += `| ${record.id} | ${escapeMarkdown(record.location)} | ${record.latitude} | ${record.longitude} | ${record.date_from} | ${record.date_to} | ${formatNumber(record.temp_min)} | ${formatNumber(record.temp_max)} | ${formatNumber(record.temp_avg)} | ${escapeMarkdown(record.weather_description || '')} | ${record.humidity !== null ? record.humidity + '%' : '—'} | ${record.wind_speed !== null ? record.wind_speed + ' km/h' : '—'} | ${record.precipitation !== null ? formatNumber(record.precipitation) + ' mm' : '—'} | ${record.created_at} |\n`;
          });
        }
        
        return new NextResponse(markdown, {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }
      
      default:
        return NextResponse.json(
          { error: `Unsupported format: ${format}. Supported: json, csv, xml, pdf, md` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to export records' },
      { status: 500 }
    );
  }
}

function generatePDF(doc, records, timestamp) {
  // Title
  doc.fontSize(24).font('Helvetica-Bold').text('Weather Records Export', { align: 'center' });
  doc.moveDown();
  
  // Metadata
  doc.fontSize(10).font('Helvetica').text(`Exported: ${new Date(timestamp).toLocaleString()}`, { align: 'center' });
  doc.text(`Record Count: ${records.length}`, { align: 'center' });
  doc.moveDown(2);
  
  if (records.length === 0) {
    doc.fontSize(12).font('Helvetica-Oblique').text('No records found.', { align: 'center' });
    return;
  }
  
  // Table
  const colWidths = [30, 80, 45, 45, 55, 55, 45, 45, 45, 60, 45, 50, 55, 65];
  const headers = ['ID', 'Location', 'Lat', 'Lon', 'From', 'To', 'Min', 'Max', 'Avg', 'Weather', 'Humid', 'Wind', 'Precip', 'Created'];
  
  // Header row
  doc.fontSize(7).font('Helvetica-Bold');
  let x = doc.page.margins.left;
  headers.forEach((header, i) => {
    doc.text(header, x, doc.y, { width: colWidths[i], align: i === 0 ? 'right' : 'left' });
    x += colWidths[i] + 5;
  });
  doc.moveDown(0.5);
  
  // Draw header line
  doc.moveTo(doc.page.margins.left, doc.y)
     .lineTo(doc.page.width - doc.page.margins.right, doc.y)
     .stroke();
  doc.moveDown(0.3);
  
  // Data rows
  doc.font('Helvetica');
  records.forEach((record, rowIndex) => {
    // Check if we need a new page
    if (doc.y > doc.page.height - 80) {
      doc.addPage();
      // Redraw header
      doc.fontSize(7).font('Helvetica-Bold');
      x = doc.page.margins.left;
      headers.forEach((header, i) => {
        doc.text(header, x, doc.y, { width: colWidths[i], align: i === 0 ? 'right' : 'left' });
        x += colWidths[i] + 5;
      });
      doc.moveDown(0.5);
      doc.moveTo(doc.page.margins.left, doc.y)
         .lineTo(doc.page.width - doc.page.margins.right, doc.y)
         .stroke();
      doc.moveDown(0.3);
      doc.font('Helvetica');
    }
    
    const row = [
      record.id.toString(),
      truncate(record.location, 20),
      record.latitude.toFixed(2),
      record.longitude.toFixed(2),
      record.date_from,
      record.date_to,
      formatNumber(record.temp_min),
      formatNumber(record.temp_max),
      formatNumber(record.temp_avg),
      truncate(record.weather_description || '', 15),
      record.humidity !== null ? record.humidity + '%' : '—',
      record.wind_speed !== null ? Math.round(record.wind_speed) + ' km/h' : '—',
      record.precipitation !== null ? formatNumber(record.precipitation) + ' mm' : '—',
      record.created_at.split('T')[0],
    ];
    
    x = doc.page.margins.left;
    row.forEach((cell, i) => {
      doc.text(cell, x, doc.y, { 
        width: colWidths[i], 
        align: i === 0 ? 'right' : 'left' 
      });
      x += colWidths[i] + 5;
    });
    doc.moveDown(0.4);
  });
}

function truncate(str, maxLen) {
  if (!str) return '—';
  return str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;
}

function escapeMarkdown(str) {
  return str.replace(/[|\\]/g, '\\$&').replace(/\n/g, ' ');
}