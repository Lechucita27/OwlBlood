# 🦉🩸 OwlBlood

**¡La Pizza Sangrienta!**

Un plataformas 2D estilo Mario hecho en un solo archivo HTML5 Canvas + JavaScript. Encarna a una lechuza de especie aleatoria y cruza niveles llenos de enemigos para conseguir la mítica pizza de peperoni con orilla rellena de queso.

---

## 🎮 Cómo jugar

Abre `index.html` en cualquier navegador moderno. No hace falta instalar nada.

### Controles

| Tecla | Acción |
|-------|--------|
| `←` `→` o `A` `D` | Mover |
| `↑`, `W` o `Espacio` | Saltar |
| `X` / `J` | Ataque de garras |
| `Enter` / `Espacio` | Iniciar partida (menú) |
| `R` | Reiniciar (victoria / game over) |

### Objetivo

Cruza el nivel evitando a los cuervos, gatos, murciélagos, serpientes, fantasmas, avispas y trampas de pinchos. Llega a la **pizza de peperoni con orilla rellena de queso** al final del nivel.

---

## 🦉 14 especies de lechuza

Cada partida eliges (aleatoriamente) una de 14 especies reales, cada una con su propio dibujo, color, ataque único y **sonido sintetizado propio**:

Barn Owl · Great Horned Owl · Snowy Owl · Spotted Owl · Burrowing Owl · Screech Owl · Elf Owl · Barred Owl · Tawny Owl · Long-eared Owl · Little Owl · Spectacled Owl · Saw-whet Owl · Boreal Owl

Cada especie tiene además su **muerte única con sangre** en la pantalla de Game Over.

---

## 🌲 Biomas animados

- Bosque 🌳
- Nieve ❄️
- Desierto 🏜️
- Cueva 🕸️
- Volcán 🔥
- Jardín Celestial ✨

Cada bioma tiene partículas ambientales animadas y su propio sonido ambiente.

---

## 🔊 Sistema de sonido

Todo el audio es **sintetizado en tiempo real** con Web Audio API — cero archivos de sonido. Incluye:

- Cadena de mezcla con compresor y reverb (feedback delay network)
- Envolventes ADSR
- Capas detuned y panoramización estéreo
- Síntesis FM para campanas, láseres y ambiente celestial
- Un sonido único por especie de lechuza, por enemigo y por bioma

---

## 🏃 Servidor local (opcional)

Para desarrollar cómodamente hay un pequeño servidor PowerShell:

```powershell
./.claude/serve.ps1 -Port 8765
```

Luego abre `http://localhost:8765/`.

---

## 🛠️ Tecnología

- HTML5 Canvas 2D
- JavaScript puro (sin frameworks)
- Web Audio API
- **Un solo archivo**: todo vive en `index.html`

---

## 📁 Estructura

```
OwlBlood/
├── index.html          # El juego entero
├── .claude/
│   ├── launch.json     # Config preview MCP
│   └── serve.ps1       # Servidor local PowerShell
├── .gitignore
└── README.md
```
