# Torre de Control - Marine Farm

Sistema de gestión y control para operaciones de Marine Farm, desarrollado con React y TypeScript.

## 🚀 Vista Previa

El proyecto está actualmente desplegado en desarrollo. Accede a la vista previa en:

**[https://3000-iwu2obnh05suax49uaklh-c07dda5e.sandbox.novita.ai](https://3000-iwu2obnh05suax49uaklh-c07dda5e.sandbox.novita.ai)**

## 📋 Descripción

Torre de Control es una aplicación web para la gestión integral de operaciones marítimas, que incluye:

- **Dashboard Principal**: Vista general de indicadores clave
- **Gestión de Pedidos**: Control de órdenes de compra y backlog
- **Envíos**: Seguimiento de embarques y documentación
- **KPIs Comerciales**: Métricas y análisis de rendimiento
- **Stock Listo**: Control de inventario disponible
- **Plan Semanal Fresco**: Planificación de producción
- **Pagos**: Gestión de pagos y créditos
- **Solicitudes de Pedido**: Sistema de creación y aprobación
- **Calculadora**: Herramientas de cálculo para operaciones

## 🛠️ Tecnologías

- **React** 18.2.0
- **TypeScript** 5.0.4
- **React Scripts** 5.0.1

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/zanacuadra/Torre-de-Control-Marine-Farm.git
cd Torre-de-Control-Marine-Farm
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm start
```

La aplicación se abrirá en [http://localhost:3000](http://localhost:3000)

## 📜 Scripts Disponibles

- `npm start` - Inicia el servidor de desarrollo
- `npm run build` - Crea una versión optimizada para producción
- `npm test` - Ejecuta los tests
- `npm run eject` - Expone la configuración de webpack (⚠️ irreversible)

## 📁 Estructura del Proyecto

```
Torre-de-Control-Marine-Farm/
├── public/
│   ├── index.html
│   ├── logo-blue.png
│   └── logo-white.png
├── src/
│   ├── api/
│   │   └── ordersApi.ts
│   ├── components/
│   │   ├── AppLayout.tsx
│   │   ├── DataTable.tsx
│   │   ├── KpiCard.tsx
│   │   ├── SidePanel.tsx
│   │   ├── Tabs.tsx
│   │   └── orderRequest/
│   │       └── OrderRequestItemRow.tsx
│   ├── mockData/
│   │   ├── commercialKpis.ts
│   │   ├── masterData.ts
│   │   ├── orderRequests.ts
│   │   ├── orders.ts
│   │   ├── payments.ts
│   │   ├── shipments.ts
│   │   ├── stockReady.ts
│   │   ├── weeklyFresh.ts
│   │   └── weeklyPlan.ts
│   ├── pages/
│   │   ├── CalculatorPage.tsx
│   │   ├── CommercialKpiPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NewOrderRequestPage.tsx
│   │   ├── OrderRequestsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── PaymentsPage.tsx
│   │   ├── ShipmentsPage.tsx
│   │   ├── StockReadyPage.tsx
│   │   └── WeeklyFreshPlanPage.tsx
│   ├── styles/
│   │   └── mf.css
│   ├── App.tsx
│   ├── index.tsx
│   ├── styles.css
│   └── types.ts
├── .eslintrc.json
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Características Principales

### Dashboard
- Vista general de KPIs y métricas importantes
- Acceso rápido a todas las secciones

### Gestión de Pedidos
- Backlog de órdenes de compra
- Seguimiento de estado de pedidos
- Historial de transacciones

### Envíos
- Control de embarques
- Seguimiento de documentación
- Auditoría de procesos

### KPIs Comerciales
- Indicadores de rendimiento
- Análisis de ventas
- Métricas de clientes

### Calculadora
- Herramientas de cálculo personalizadas
- Conversiones de unidades
- Estimaciones de costos

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza variables de entorno para configuración. Puedes crear archivos `.env` para diferentes entornos:

- `.env.local` - Variables locales (no se suben al repositorio)
- `.env.development` - Variables de desarrollo
- `.env.production` - Variables de producción

### ESLint

La configuración de ESLint se encuentra en `.eslintrc.json`. Algunas reglas están deshabilitadas para facilitar el desarrollo.

## 📝 Datos Mock

El proyecto utiliza datos de prueba (mock data) almacenados en `src/mockData/`. Estos datos pueden ser reemplazados por llamadas a API reales en el futuro.

## 🤝 Contribución

Para contribuir al proyecto:

1. Crea un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Sube tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a Marine Farm.

## 👥 Autor

- **Desarrollador**: Marine Farm Team
- **Repositorio**: https://github.com/zanacuadra/Torre-de-Control-Marine-Farm

## 📞 Soporte

Para reportar problemas o sugerencias, abre un issue en el repositorio de GitHub.

---

**Última actualización**: Febrero 2026
