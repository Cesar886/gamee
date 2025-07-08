# 🌱 Mi Mascota Virtual

Un juego de mascota virtual tipo Tamagotchi creado con HTML, CSS y JavaScript puro. ¡Cuida de tu pequeña criaturita y mantenla feliz y saludable!

## 🎮 Características

- **Completamente offline**: Funciona sin conexión a internet una vez cargado
- **Almacenamiento local**: El estado de tu mascota se guarda automáticamente en tu navegador
- **Responsive**: Se adapta perfectamente a dispositivos móviles y de escritorio
- **PWA Ready**: Se puede instalar como aplicación en tu dispositivo
- **Ligero**: Menos de 50KB en total

## 🕹️ Cómo jugar

### Estadísticas de tu mascota:
- **Hambre** 🍎: Se reduce con el tiempo, aliméntala regularmente
- **Felicidad** 😊: Juega con ella para mantenerla contenta
- **Salud** 💚: Se ve afectada por otras estadísticas bajas
- **Energía** ⚡: Se agota al jugar, necesita dormir para recuperarse

### Acciones disponibles:
- **🍎 Alimentar**: Reduce el hambre y aumenta un poco la felicidad
- **🎾 Jugar**: Aumenta mucho la felicidad pero consume energía y hambre
- **💊 Curar**: Mejora la salud y un poco la felicidad
- **😴 Dormir**: Pone a dormir a tu mascota para recuperar energía

### Estados especiales:
- **😴 Durmiendo**: Tu mascota recupera energía gradualmente
- **🤒 Enferma**: Cuando la salud está muy baja
- **💀 Muerta**: Si no cuidas bien a tu mascota... ¡pero puedes reiniciarla!

## 🚀 Instalación en GitHub Pages

1. Sube todos los archivos a tu repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama main como fuente
4. ¡Tu juego estará disponible en `https://tu-usuario.github.io/nombre-repositorio`!

## 📱 Instalación como PWA

1. Abre el juego en tu navegador móvil
2. Busca la opción "Añadir a pantalla de inicio" o "Instalar aplicación"
3. ¡Ahora puedes jugar desde tu pantalla de inicio!

## 🛠️ Archivos incluidos

- `index.html` - Estructura principal del juego
- `style.css` - Estilos y animaciones
- `script.js` - Lógica del juego y localStorage
- `manifest.json` - Configuración PWA
- `sw.js` - Service Worker para funcionamiento offline
- `README.md` - Este archivo de instrucciones

## 🎨 Personalización

Puedes personalizar fácilmente:
- **Nombre de la mascota**: Cambia "Plantita" en el código
- **Sprites**: Modifica los emojis en el objeto `petSprites`
- **Colores**: Ajusta los gradientes en el CSS
- **Velocidad de degradación**: Modifica los valores en `updatePetStats()`

## 💡 Consejos

- Revisa tu mascota regularmente (cada 30 minutos aproximadamente)
- Mantén todas las estadísticas por encima del 20% para evitar problemas
- Si tu mascota está muy cansada, ponla a dormir antes de jugar
- El juego continúa funcionando incluso cuando cierras el navegador

## 🔧 Requisitos técnicos

- Navegador moderno con soporte para:
  - localStorage
  - Service Workers (opcional, para funcionamiento offline)
  - ES6+ JavaScript

¡Disfruta cuidando de tu mascota virtual! 🌱✨

