# timeVault
Vault Time

Bienvenido a *Vault Time* una plataforma colaborativa y descentralizada creada para preservar fragmentos valiosos de la historia digital.

¿Alguna vez recordaste una canción, un videojuego o una escena de una serie sin poder ubicar exactamente de dónde venía? Según la UNESCO, más del 90% del contenido digital creado antes del año 2000 está en riesgo de desaparecer.

*Vault Time* nace para frenar esa pérdida. No solo almacenamos datos: los conservamos, protegemos y compartimos de forma segura y accesible, sin necesidad de conocimientos técnicos avanzados.


🔧 Estructura del Proyecto

Vault Time funciona como un repositorio digital donde los usuarios pueden:

- Subir archivos multimedia y documentos.
- Clasificarlos mediante metadatos útiles.
- Compartirlos dentro de una red segura y descentralizada.


📊El flujo guía al usuario paso a paso para el funcionamiento del proyecto:

1. Abre tu repositorio generado.
2. Inicia sesion en tu wallet de Meta Mask.
3. se abrira una ventana emergente de Meta Mask donde muestra el nombre de usuario.
4. una vez realizado esto regresamos al la ventana del repositorio en la cual podemos visualizar varias opciones **subir, descargar, conectar a la wallet y buscar**
5. Para que funcionen estas opciones dos de ellas (subir, descargar), deben esperar a que la wallet les otorgue permisos ya que de lo contrario no se realiza el cobro de transacciones.
6. Estos procesos al autorizarce se guardan en automatico dentro del blockchain, asi igual permiten la descarga de los mismos.
7. El mismo repositorio nos perimite dentro de un aparto visualizar que documentos ya estan guardados en el mismo, ais mismo muestra todas las transacciones realizadas.

⚙️ Implementación

La plataforma utiliza contratos inteligentes desarrollados en **Arbitrum**, aprovechando la tecnología blockchain para garantizar la descentralización, seguridad e inmutabilidad de los datos. Cada archivo subido queda protegido y es verificable.

🛠 Entornos de Desarrollo

- *Visual Studio Code* – para programar contratos inteligentes y la interfaz web.
- **Bitso / Vixo** – para la creación e integración de wallets digitales.
- **Arbitrum** – red blockchain de segunda capa para validar y almacenar contenido eficientemente.
- **Arbitrum One**- Es la red Layer 2 principal de Arbitrum. Usa tecnología Optimistic Rollup. Ideal para aplicaciones DeFi, dApps complejas y mainnet-ready. Tiene alta seguridad porque está conectada a Ethereum L1.

📌 Creación de Tareas

*(Aquí puedes agregar detalles sobre cómo subir contenido, validarlo y vincularlo con contratos en Arbitrum)*

 🚀 Inicio Rápido

Cómo iniciar:
RPC URL:
https://arb1.arbitrum.io/rpc

Chain ID: 42161

Wallet compatible: Metamask, WalletConnect.

Tokens: Usa ETH como gas, necesitas enviar ETH a través del Arbitrum Bridge.

Explorador:
https://arbiscan.io

Implementación:
Compatible con herramientas de Ethereum como Hardhat o Foundry.

Simplemente cambias la configuración de red a Arbitrum One.

Ejemplo de config en hardhat.config.js:

js
Copiar
Editar
networks: {
  arbitrum: {
    url: "https://arb1.arbitrum.io/rpc",
    accounts: [PRIVATE_KEY],
  },
}


 💡 ¿Por Qué Importa?

Lo que hoy parece una carpeta olvidada, mañana puede ser el testimonio de una cultura, una generación o incluso un país.

Vault Time no es solo un proyecto — es una invitación a construir memoria.

❓ Dudas o Problemas

Si necesitas más información o asistencia, contacta al responsable del proyecto e incluye los detalles del problema para una solución rápida.

 📬 Contacto

¿Quieres contribuir o preservar tu propio legado digital?

- Correo: vaulttime1@gmail.com

📝 Notas

- Necesitas una **cuenta wallet activa** para subir archivos.
- Este proyecto tiene fines **educativos y lucrativos**.


**ENGLISH VERSION**

## Vault Time

Welcome to *Vault Time*, a collaborative and decentralized platform created to preserve valuable fragments of digital history.

Have you ever remembered a song, a video game, or a scene from a show without being able to place exactly where it came from? According to UNESCO, over 90% of digital content created before the year 2000 is at risk of disappearing.

*Vault Time* was born to stop that loss. We don’t just store data—we preserve it, protect it, and share it in a secure and accessible way, without requiring advanced technical knowledge.


🔧 **Project Structure**

Vault Time works as a digital repository where users can:

* Upload multimedia files and documents.
* Classify them using useful metadata.
* Share them within a secure, decentralized network.


📊 **Flow Diagram**

*(An image of the system flow diagram will be placed here)*

The flow guides the user step-by-step:

1. Create a wallet account.
2. Upload the file.
3. Classify it.
4. Permanently store it on the blockchain using smart contracts.


⚙️ **Implementation**

The platform uses smart contracts developed on **Arbitrum**, leveraging blockchain technology to ensure decentralization, security, and data immutability. Every uploaded file is protected and verifiable.


🛠 **Development Environments**

* *Visual Studio Code* – for coding smart contracts and the web interface.
* **Bitso / Vixo** – for creating and integrating digital wallets.
* **Arbitrum** – a Layer 2 blockchain network for efficient validation and content storage.
* **Arbitrum One** – the main Layer 2 network of Arbitrum, using Optimistic Rollup technology. Ideal for DeFi apps, complex dApps, and production-level deployment. It provides high security by being connected to Ethereum L1.


📌 **Task Creation**

*(Here you can add details on how to upload content, validate it, and link it to contracts on Arbitrum)*


🚀 **Quick Start**

How to get started:

* **RPC URL**:
  `https://arb1.arbitrum.io/rpc`

* **Chain ID**:
  `42161`

* **Compatible Wallets**:
  Metamask, WalletConnect.

* **Tokens**:
  ETH is used for gas. You need to send ETH via the Arbitrum Bridge.

* **Explorer**:
  [https://arbiscan.io](https://arbiscan.io)

* **Deployment**:
  Compatible with Ethereum tools like Hardhat or Foundry.
  Simply change the network configuration to Arbitrum One.

**Example in `hardhat.config.js`:**

```js
networks: {
  arbitrum: {
    url: "https://arb1.arbitrum.io/rpc",
    accounts: [PRIVATE_KEY],
  },
}
```

1. Create a wallet account.
2. Log into the platform.
3. Upload and classify your file.
4. Confirm its preservation on the blockchain.
5. Share your digital legacy.


💡 **Why Does It Matter?**

What seems like a forgotten folder today might become tomorrow’s testimony of a culture, a generation, or even a nation.

Vault Time is not just a project—it’s an invitation to build memory.


❓ **Questions or Issues**

If you need more information or assistance, contact the project lead and include problem details for a fast solution.

📬 **Contact**

Want to contribute or preserve your own digital legacy?

* Email: vaulttime1@gmail.com


📝 **Notes**

* You need an **active wallet account** to upload files.
* This project is **educational and non-profit**.
