const db = require('../config/db');
const ExcelJS = require('exceljs');

// Helper interno para aplicar estilos corporativos premium a los encabezados
const aplicarEstiloEncabezado = (sheet, title, columns) => {
    // Título Principal
    sheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = title;
    titleCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2D3748' } };
    sheet.getRow(1).height = 40;

    // Fila vacía de separación
    sheet.getRow(2).height = 15;

    // Encabezados de Columnas
    const headerRow = sheet.getRow(3);
    headerRow.height = 25;
    headerRow.values = columns.map(c => c.header);
    
    columns.forEach((col, idx) => {
        const cell = headerRow.getCell(idx + 1);
        cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '5B9BD5' } };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'medium', color: { argb: '2D3748' } },
            bottom: { style: 'medium', color: { argb: '2D3748' } }
        };
    });
};

// Helper interno para autoajustar columnas y aplicar bordes finos a los datos
const finalizarFormatoTabla = (sheet, startRow, totalRows, numCols) => {
    for (let r = startRow; r < startRow + totalRows; r++) {
        const row = sheet.getRow(r);
        row.height = 20;
        for (let c = 1; c <= numCols; c++) {
            const cell = row.getCell(c);
            cell.font = { name: 'Segoe UI', size: 10 };
            cell.border = {
                top: { style: 'thin', color: { argb: 'E2E8F0' } },
                bottom: { style: 'thin', color: { argb: 'E2E8F0' } },
                left: { style: 'thin', color: { argb: 'E2E8F0' } },
                right: { style: 'thin', color: { argb: 'E2E8F0' } }
            };
        }
    }
    // Autoajustar anchos basándose en el contenido más largo
    sheet.columns.forEach(column => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: true }, cell => {
            const valLen = cell.value ? cell.value.toString().length : 0;
            if (valLen > maxLen) maxLen = valLen;
        });
        column.width = Math.max(maxLen + 4, 12);
    });
};

// 1. REPORTES DE CONVOCATORIAS GENERALES
exports.getReporteConvocatorias = async (req, res, next) => {
    try {
        const query = `
            SELECT c.codigo, c.titulo, c.tipo,
                   COUNT(s.id) as total_proyectos,
                   SUM(CASE WHEN s.estado = 'Borrador' THEN 1 ELSE 0 END) as borradores,
                   SUM(CASE WHEN s.estado = 'Radicado' THEN 1 ELSE 0 END) as radicados,
                   SUM(CASE WHEN s.estado = 'En Evaluación' THEN 1 ELSE 0 END) as en_evaluacion,
                   SUM(CASE WHEN s.estado = 'Aprobado' THEN 1 ELSE 0 END) as aprobados,
                   SUM(CASE WHEN s.estado = 'Rechazado' THEN 1 ELSE 0 END) as rechazados
            FROM convocatorias c
            LEFT JOIN solicitudes s ON c.id = s.convocatoria_id
            GROUP BY c.id, c.codigo, c.titulo, c.tipo
            ORDER BY c.created_at DESC;
        `;
        const [rows] = await db.query(query);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Convocatorias');

        const columns = [
            { header: 'Código' },
            { header: 'Título Convocatoria' },
            { header: 'Tipo' },
            { header: 'Total Proyectos' },
            { header: 'Borradores' },
            { header: 'Radicados' },
            { header: 'En Evaluación' },
            { header: 'Aprobados' },
            { header: 'Rechazados' }
        ];

        aplicarEstiloEncabezado(sheet, 'REPORTE GENERAL DE CONVOCATORIAS - ARCHIVEX', columns);

        rows.forEach(row => {
            sheet.addRow([
                row.codigo,
                row.titulo,
                row.tipo,
                Number(row.total_proyectos || 0),
                Number(row.borradores || 0),
                Number(row.radicados || 0),
                Number(row.en_evaluacion || 0),
                Number(row.aprobados || 0),
                Number(row.rechazados || 0)
            ]);
        });

        finalizarFormatoTabla(sheet, 4, rows.length, columns.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Convocatorias_ArchiveX.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// 2. DEMOGRAFÍA POR SEDES
exports.getReporteSedesDemografia = async (req, res, next) => {
    try {
        const query = `
            SELECT sd.nombre_sede, u.carrera_titulo, u.nivel_educativo, COUNT(u.id) as total_profesores
            FROM usuarios u
            INNER JOIN solicitudes s ON u.id = s.usuario_id
            INNER JOIN sedes sd ON s.sede_id = sd.id
            WHERE u.rol IN ('Docente', 'Profesor')
            GROUP BY sd.nombre_sede, u.carrera_titulo, u.nivel_educativo
            ORDER BY sd.nombre_sede ASC, total_profesores DESC;
        `;
        const [rows] = await db.query(query);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Demografía por Sedes');

        const columns = [
            { header: 'Sede Universitaria' },
            { header: 'Título Profesional / Carrera' },
            { header: 'Nivel Educativo alcanzado' },
            { header: 'Cantidad de Profesores' }
        ];

        aplicarEstiloEncabezado(sheet, 'DEMOGRAFÍA ASIGNADA DE PROFESORES POR SEDE', columns);

        rows.forEach(row => {
            sheet.addRow([
                row.nombre_sede,
                row.carrera_titulo || 'No registrado',
                row.nivel_educativo || 'No registrado',
                Number(row.total_profesores || 0)
            ]);
        });

        finalizarFormatoTabla(sheet, 4, rows.length, columns.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Demografia_Sedes.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// 3. CONTROL DE EVALUADORES Y PROYECTOS ASIGNADOS
exports.getReporteEvaluadores = async (req, res, next) => {
    try {
        const query = `
            SELECT u.nombre_completo AS evaluador, u.email,
                   COUNT(ae.id) as total_asignados,
                   SUM(CASE WHEN ae.estado_evaluacion = 'Asignado' THEN 1 ELSE 0 END) as asignados,
                   SUM(CASE WHEN ae.estado_evaluacion = 'En Progreso' THEN 1 ELSE 0 END) as en_progreso,
                   SUM(CASE WHEN ae.estado_evaluacion = 'Finalizado' THEN 1 ELSE 0 END) as finalizados,
                   IFNULL(AVG(CASE WHEN ae.estado_evaluacion = 'Finalizado' THEN ae.puntaje END), 0.00) as promedio_puntaje
            FROM usuarios u
            LEFT JOIN asignacion_evaluaciones ae ON u.id = ae.evaluador_id
            WHERE u.rol = 'Evaluador'
            GROUP BY u.id, u.nombre_completo, u.email
            ORDER BY total_asignados DESC;
        `;
        const [rows] = await db.query(query);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Evaluadores');

        const columns = [
            { header: 'Nombre Evaluador' },
            { header: 'Correo Electrónico' },
            { header: 'Total Asignados' },
            { header: 'Estado: Asignado' },
            { header: 'Estado: En Progreso' },
            { header: 'Estado: Finalizado' },
            { header: 'Puntaje Promedio Otorgado' }
        ];

        aplicarEstiloEncabezado(sheet, 'INFORME Y CONTROL DE EVALUADORES - ARCHIVEX', columns);

        rows.forEach(row => {
            sheet.addRow([
                row.evaluador,
                row.email,
                Number(row.total_asignados || 0),
                Number(row.asignados || 0),
                Number(row.en_progreso || 0),
                Number(row.finalizados || 0),
                parseFloat(row.promedio_puntaje || 0).toFixed(2)
            ]);
        });

        finalizarFormatoTabla(sheet, 4, rows.length, columns.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Control_Evaluadores.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};

// 4. REPORTE DE PROYECTOS Y TÍTULOS ASOCIADOS
exports.getReporteProyectosTitulos = async (req, res, next) => {
    try {
        const query = `
            SELECT s.num_solicitud, s.titulo_propuesta, s.estado, 
                   u.nombre_completo AS docente, u.nivel_educativo, u.carrera_titulo,
                   sd.nombre_sede
            FROM solicitudes s
            INNER JOIN usuarios u ON s.usuario_id = u.id
            INNER JOIN sedes sd ON s.sede_id = sd.id
            ORDER BY s.created_at DESC;
        `;
        const [rows] = await db.query(query);

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Proyectos y Títulos');

        const columns = [
            { header: 'N° Radicado' },
            { header: 'Título de la Propuesta' },
            { header: 'Estado Actual' },
            { header: 'Docente Investigador' },
            { header: 'Nivel Académico' },
            { header: 'Carrera Profesional' },
            { header: 'Sede Asociada' }
        ];

        aplicarEstiloEncabezado(sheet, 'AUDITORÍA CONSOLIDADA DE PROYECTOS Y TÍTULOS', columns);

        rows.forEach(row => {
            sheet.addRow([
                row.num_solicitud,
                row.titulo_propuesta,
                row.estado,
                row.docente,
                row.nivel_educativo || 'No especificado',
                row.carrera_titulo || 'No especificado',
                row.nombre_sede
            ]);
        });

        finalizarFormatoTabla(sheet, 4, rows.length, columns.length);

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Proyectos_Titulos.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        next(error);
    }
};