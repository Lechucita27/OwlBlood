# OwlBlood — Contexto para desarrollo

Documento de referencia para trabajar en el proyecto sin tener que releer todo
el código cada vez. Pensado como "briefing" para retomar la sesión o para que
un contribuidor nuevo se oriente rápido.

---

## 1. Qué es

Plataformas 2D estilo Mario con una lechuza de especie aleatoria. El objetivo
"campaña" es llegar a una pizza de peperoni con orilla rellena de queso al
final del nivel. Hay también un modo **Battle Royale** contra 100 bots.

- **Tecnología**: HTML5 Canvas 2D + JavaScript vanilla. Cero dependencias.
- **Audio**: todo sintetizado en vivo con Web Audio API, cero archivos.
- **Canvas fijo**: 800×450.
- **Mundo campaña**: 5400 px de ancho. Battle Royale expande `WORLD_W` en
  runtime.

---

## 2. Estructura de archivos

```
OwlBlood/
├── index.html           # Shell HTML. Sólo <canvas> + <script src> en orden.
├── src/
│   ├── 01-core.js       # Constantes, BIOMES, utils, SoundSystem, SFX, OWL_SPECIES, drawRR
│   ├── 02-render.js     # shade, drawOwl, blood*, drawOwlDeath, lerpColor, drawPizza, drawSpeciesAttack
│   ├── 03-entities.js   # Camera, RARITIES, WEAPON_TYPES, WeaponPickup, Bullet, BotOwl,
│   │                    # playWeaponSound, Platform, MovingPlatform, Enemy + subclases, SpikeTrap,
│   │                    # Pizza, SecretBlock
│   ├── 04-player.js     # Chick, CompanionOwl, Player
│   ├── 05-game.js       # buildLevel(), class Game (loop, estados, HUD, niveles)
│   └── 06-main.js       # window.onload = () => new Game(...).start()
├── .claude/
│   ├── launch.json      # Preview MCP (servidor en localhost:8765)
│   └── serve.ps1        # Servidor HTTP estático en PowerShell
├── tools/
│   └── split.ps1        # Script que troceó index.html en src/*.js (referencia)
├── README.md
├── CONTEXT.md           # Este archivo
└── .gitignore
```

### Reglas de carga

Los seis archivos de `src/` son **scripts clásicos** (no ES modules) y
**comparten scope global** — todas las clases y helpers se definen como
declaraciones top-level. **El orden de las `<script src>` importa** porque
las clases se referencian sin `import`. Si hace falta mover código entre
archivos, respetar estas dependencias:

- `01-core` define `SFX`, `OWL_SPECIES`, constantes, utils → lo usa todo.
- `02-render` usa utils de core → lo usan las entidades para dibujar.
- `03-entities` define entidades usadas por `Player` y por `Game`.
- `04-player` usa entidades (para colisiones, etc).
- `05-game` orquesta todo lo anterior.
- `06-main` bootstrapea.

**No convertir a ES modules sin planificar**: ~30 clases con referencias
cruzadas; el cambio es mecánico pero extenso.

---

## 3. Ciclo de vida y estados

`Game` es el orquestador. Estados (`this.state`):

| Estado         | Entrada                                | Pantalla                                   |
|----------------|----------------------------------------|--------------------------------------------|
| `menu`         | Inicio                                 | Preview de lechuzas rotando, start prompt  |
| `playing`      | Enter/Espacio desde menú (campaña)     | Nivel con pizza objetivo                   |
| `battleroyale` | Tecla B desde menú (si está expuesto)  | Arena extendida con 100 bots + zona gas    |
| `win`          | Pizza recogida                         | Pantalla de victoria                       |
| `gameover`     | Jugador muerto y fuera de cámara       | Overlay rojo + muerte específica de especie |

`gameLoop(ts)` llama a `update()` y `draw()`, ambos envueltos en `try/catch`
— un error en un frame NO brickea el `requestAnimationFrame`. Esto se puso
tras un bug donde un color hex inválido en `addColorStop` mataba el loop.

---

## 4. Sistemas clave

### 4.1 Física
- Gravedad: `GRAVITY = 0.52`.
- Salto: `JUMP_FORCE = -12.5`.
- Velocidad horizontal: `SPD = 4.2`.
- Colisiones: **AABB resuelto por ejes separados** (primero X, luego Y).
- `onGround` se resetea cada frame; sólo se activa al resolver Y contra suelo.
- Plataformas móviles: `Player` rastrea `standingPlatform` y suma `platform.dx`.

### 4.2 Combate cuerpo a cuerpo (garras)
- Cooldown `CLAW_CD = 300` frames (5 s).
- Animación `CLAW_FRAMES = 60` con fases: windup(0-18) · dash(18-42) ·
  impact(42-52) · recovery(52-60).
- El daño se aplica en `CLAW_DASH = 42`.

### 4.3 Armas (modo Battle Royale)
Definidas en `03-entities.js`.

- `RARITIES`: `comun`, `raro`, `epico`, `legendario`, `mitico` — cada uno con
  `color`, `glow` (hex de **6 dígitos** siempre — ver gotcha), peso de drop.
- `WEAPON_TYPES`: ~20 armas (pistol, shotgun, rifle, SMG, uzi, sniper, …).
- `pickWeaponByRarity(rarity)` → escoge un arma aleatoria compatible.
- `randomWeapon()` → combina rareza por peso + arma por categoría.
- `WeaponPickup` entidad que flota y se recoge.

### 4.4 Sonido
`SoundSystem` (01-core) expone `SFX` como singleton.
- Cadena: osciladores → envolvente ADSR → panner → compresor → reverb FDN.
- Sonido único por especie de lechuza, por enemigo, por bioma, por arma.
- El audio está bloqueado hasta interacción (política del navegador). `SFX`
  se "desbloquea" al primer input.

### 4.5 Enemigos
Jerarquía en `03-entities.js`:
- `Enemy` (base)
  - `WalkingEnemy` — patrulla
  - `JumpingEnemy` — salta cuando el jugador se acerca
  - `BatEnemy` — vuela en seno
  - `SnakeEnemy`
  - `GhostEnemy` (no hereda, atraviesa plataformas)
  - `WaspEnemy`
- `SpikeTrap` — no se mueve, hace daño al tocar.

### 4.6 Compañeras: Chick y CompanionOwl
- `SecretBlock` (bloque ?) cada `BLOCK_INT = 1200` frames da compañera.
- `CompanionOwl` lucha con el jugador.
- `Chick` (pollito) tiene comportamiento de **divagar**:
  - Estado normal: sigue al jugador, invencible a enemigos.
  - Estado `stray`: se aleja en direcciones aleatorias
    (timer 360-900f, duración 180-360f).
  - Si supera 240+36 px del jugador estando en `stray` → `_getEaten(enemy)`,
    muere comido.
  - Vuelve al jugador si se acerca a <140 px.
- Diseño: los pollitos duran toda la partida salvo que se alejen demasiado —
  no son desechables.

---

## 5. Renderizado

### 5.1 Especies de lechuza
`OWL_SPECIES` en `01-core.js` — **14 especies reales**, cada una con:
- Color de cuerpo, color secundario, rasgos faciales.
- Estilo de ataque (`drawSpeciesAttack` en 02-render).
- Muerte única con sangre (`drawOwlDeath` en 02-render).
- Sonido propio (via `SFX`).

Se selecciona una aleatoria por partida. Dibujo centralizado en `drawOwl()`.

### 5.2 Biomas
`BIOMES` en `01-core.js` — 6 biomas: forest, snow, desert, cave, volcanic,
celestial. Cada uno define colores de cielo/plataformas, decoraciones,
partículas ambientales (`deco` key), color de FX. Variable global
`currentBiome` se setea al construir nivel.

### 5.3 Pizza
`drawPizza(ctx, cx, cy, sc, t)` en `02-render.js` — 6 capas top-down (orilla,
queso relleno, salsa, queso, peperoni, hilos) con bobbing vertical
`sin(t*0.05)*3`.

---

## 6. Controles

| Tecla                  | Acción                       |
|------------------------|------------------------------|
| `←` `→` o `A` `D`      | Mover                        |
| `↑`, `W`, `Espacio`    | Saltar                       |
| `X` / `J` / `Z` / `E`  | Ataque de garras             |
| `Enter` / `Espacio`    | Iniciar (desde menú)         |
| `R`                    | Reiniciar (win/gameover)     |
| Mouse                  | Apuntar en Battle Royale     |
| Click izq              | Disparar (Battle Royale)     |

(Los bindings concretos viven en el handler de teclado de `Player` y `Game`.)

---

## 7. Correr el juego

### Local vía servidor PowerShell
```powershell
./.claude/serve.ps1 -Port 8765
```
Luego abrir `http://localhost:8765/`. **No abrir `index.html` por `file://`**:
algunos navegadores bloquean carga de `src/*.js` relativos con CORS/file.

### Preview MCP (Claude Code)
`.claude/launch.json` define el servidor `lechucode`. El MCP
`Claude_Preview__preview_start` lo arranca automáticamente.

### Notas
- `node` **NO está disponible** en este Windows. Cualquier script de
  automatización debe usar PowerShell (ver `tools/split.ps1`).
- Los git hooks en este repo no están configurados; commits directos OK.

---

## 8. Gotchas documentados

1. **Hex colors de 6 dígitos obligatorios** cuando se concatena alpha. Ej:
   `"#888" + "44"` → `"#88844"` → crash en `addColorStop`. Siempre usar
   `"#888888"`. Esto brickeó el modo Battle Royale antes del try/catch.
2. **`requestAnimationFrame` se throttlea** en pestañas ocultas / preview
   headless. Si al evaluar desde `preview_eval` el juego parece pasmado,
   llamar `g.update(); g.draw();` manualmente para depurar.
3. **Scope global compartido**: declarar una clase con el mismo nombre en dos
   archivos de `src/` = `SyntaxError` al cargar el segundo (duplicate
   declaration). No hay aislamiento por archivo.
4. **`WORLD_W` es mutable** (`let`, no `const`). Battle Royale la agranda.
   Si se añade un estado nuevo, resetearla a `5400` al volver a campaña.
5. **Backups `.bak`**: `tools/split.ps1` no crea backup. Hacerlo a mano antes
   de regenerar (`cp index.html index.html.bak`).

---

## 9. Cómo añadir cosas

### Nueva especie de lechuza
1. Añadir entrada en `OWL_SPECIES` (01-core): nombre, colores, `attackStyle`,
   `deathStyle`, `sound`.
2. Añadir rama en `drawOwl` (02-render) si el rasgo visual lo requiere.
3. Añadir rama en `drawSpeciesAttack` y `drawOwlDeath`.
4. Añadir caso en el sintetizador de sonido de especie en `SoundSystem`.

### Nuevo enemigo
1. Nueva clase en `03-entities.js` extendiendo `Enemy` (o autónoma como
   `GhostEnemy`).
2. Implementar `update(level, player)` y `draw(ctx, camX)`.
3. Registrar instancia(s) en `buildLevel()` (05-game) o en el spawner de BR.

### Nueva arma
1. Añadir a `WEAPON_TYPES` en 03-entities con `id`, `name`, `damage`,
   `fireRate`, `spread`, `bulletSpeed`, `ammo`, `category`.
2. Añadir caso en `playWeaponSound(id)` si requiere SFX propio.

### Nuevo bioma
1. Entrada en `BIOMES` con paleta completa y `deco` key.
2. Implementar rama `deco` en la función de partículas ambientales.
3. Sonido ambiente en `SoundSystem`.

---

## 10. Comandos útiles

```powershell
# Servidor local
./.claude/serve.ps1 -Port 8765

# Re-trocear index.html desde un monolito (si algún día se invierte la
# modularización y hace falta re-generar)
powershell -NoProfile -ExecutionPolicy Bypass -File tools/split.ps1
```

```bash
# Git
git log --oneline -10
git status
```

---

## 11. Historial de cambios grandes

- `86b69ba` Modularización: `index.html` → `src/*.js`.
- `89ae2c8` Fix freeze de BR (hex color inválido).
- `435f951` Chicks divagan y mueren si te alejas demasiado.
- `e0b808f` Rework Battle Royale: 100 bots, 20 armas con rarezas, zona de
  gas, mira con mouse.
- `9ac07de` Modo BATTLE ROYALE beta con armas.
- `fc7b544` Chick spawn 30% → 50%.
