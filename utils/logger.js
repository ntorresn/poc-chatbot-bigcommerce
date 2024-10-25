const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Configuración del logger
const createLogger = () => {
    return winston.createLogger({
        level: 'info', // Nivel mínimo de log
        format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'  // Añadir la marca de tiempo a los logs
            }),
            winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`) // Formato de salida
        ),
        transports: [
            new DailyRotateFile({
                filename: 'logs/application-%DATE%.log',  // Ruta y nombre del archivo con el patrón %DATE%
                datePattern: 'YYYY-MM-DD',                // Rotar los logs diariamente
                zippedArchive: true,                      // Comprimir archivos antiguos
                maxSize: '20m',                           // Tamaño máximo antes de rotar
                maxFiles: '14d'                           // Mantener solo los últimos 14 días
            }),
            new winston.transports.Console({             // Loguear en la consola con colores
                format: winston.format.combine(
                    winston.format.colorize(),           // Agregar colores dependiendo del nivel de log
                    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
                )
            })
        ]
    });
};

const logger = createLogger();
module.exports = logger;
