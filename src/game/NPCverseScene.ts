import Phaser from 'phaser';
import { NPCS } from './npcs';
import type { NpcId } from './types';

type SceneCallbacks = { onNearbyNpc: (npcId: NpcId | null) => void; onWorldReady: () => void };

export class NPCverseScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private nearby: NpcId | null = null;
  private promptText!: Phaser.GameObjects.Text;
  private callbacks: SceneCallbacks;
  constructor(callbacks: SceneCallbacks) { super('Everwood'); this.callbacks = callbacks; }

  create() {
    this.physics.world.setBounds(0, 0, 960, 640);
    this.cameras.main.setBounds(0, 0, 960, 640);
    this.cameras.main.setZoom(1.35);
    this.drawWorld();
    const playerTexture = this.makePersonTexture('player', 0xd7b27b, 0x354f48);
    this.player = this.physics.add.sprite(480, 470, playerTexture);
    this.player.setDepth(20).setCollideWorldBounds(true);
    (this.player.body as Phaser.Physics.Arcade.Body).setSize(12, 10).setOffset(2, 18);
    this.addWorldCollisions();
    this.promptText = this.add.text(0, 0, '[ E ]  TALK', {
      fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#fff0c9',
      backgroundColor: '#293b2e', padding: { x: 7, y: 5 },
    }).setOrigin(0.5).setDepth(1000).setVisible(false);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    NPCS.forEach((npc) => {
      const texture = this.makePersonTexture(npc.id, npc.color, npc.id === 'arthur' ? 0x526b52 : 0x68475c);
      const sprite = this.add.image(0, 0, texture);
      const shadow = this.add.ellipse(0, 13, 22, 7, 0x14221b, 0.35);
      const name = this.add.text(0, -28, npc.name.split(' ')[0], {
        fontFamily: 'DM Mono, monospace', fontSize: '9px', color: '#f4e7c7',
        backgroundColor: '#26372c', padding: { x: 5, y: 3 },
      }).setOrigin(0.5);
      this.add.container(npc.x, npc.y, [shadow, sprite, name]).setDepth(npc.y);
    });
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys('W,A,S,D,E') as Record<string, Phaser.Input.Keyboard.Key>;
    this.callbacks.onWorldReady();
  }

  private makePersonTexture(id: string, shirt: number, trousers: number): string {
    const key = `pixel-${id}`;
    if (this.textures.exists(key)) return key;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    const px = (x: number, y: number, w: number, h: number, color: number) => { g.fillStyle(color, 1); g.fillRect(x, y, w, h); };
    px(7, 0, 10, 3, 0x49382d); px(5, 3, 14, 10, 0xc88f68);
    px(4, 6, 3, 6, 0x49382d); px(17, 6, 3, 6, 0x49382d);
    px(8, 7, 2, 2, 0x2a2926); px(14, 7, 2, 2, 0x2a2926);
    px(6, 13, 12, 10, shirt); px(3, 14, 4, 8, shirt); px(17, 14, 4, 8, shirt);
    px(7, 22, 5, 7, trousers); px(13, 22, 5, 7, trousers);
    px(6, 28, 6, 3, 0x49382d); px(13, 28, 6, 3, 0x49382d);
    g.generateTexture(key, 24, 34); g.destroy(); return key;
  }

  private addWorldCollisions() {
    const obstacles = [
      this.add.rectangle(375, 244, 168, 18, 0xffffff, 0),
      this.add.rectangle(642, 356, 163, 18, 0xffffff, 0),
      this.add.rectangle(95, 100, 42, 36, 0xffffff, 0),
      this.add.rectangle(175, 200, 42, 36, 0xffffff, 0),
      this.add.rectangle(790, 100, 42, 36, 0xffffff, 0),
      this.add.rectangle(850, 260, 42, 36, 0xffffff, 0),
      this.add.rectangle(760, 520, 42, 36, 0xffffff, 0),
      this.add.rectangle(160, 550, 42, 36, 0xffffff, 0),
      this.add.rectangle(900, 470, 42, 36, 0xffffff, 0),
    ];
    for (const obstacle of obstacles) {
      this.physics.add.existing(obstacle, true);
      this.physics.add.collider(this.player, obstacle);
    }
  }

  private drawWorld() {
    const g = this.add.graphics();
    g.fillStyle(0x6d875c); g.fillRect(0, 0, 960, 640);
    for (let y = 0; y < 640; y += 32) for (let x = 0; x < 960; x += 32) {
      if (((x / 32) * 7 + (y / 32) * 3) % 5 === 0) { g.fillStyle(0x789365, 0.6); g.fillRect(x + 3, y + 4, 25, 23); }
      if ((x + y) % 4 === 0) { g.fillStyle(0x536f4d, 0.55); g.fillRect(x + 10, y + 17, 2, 4); }
    }
    g.fillStyle(0xc7ad7c); g.fillRect(0, 430, 960, 105);
    g.fillStyle(0xd4bd8d, 0.7); g.fillRect(0, 440, 960, 7);
    this.drawBuilding(g, 300, 145, 150, 105, 0x9b7654, 0x704b3d, 'GENERAL STORE');
    this.drawBuilding(g, 570, 265, 145, 100, 0x91694e, 0x633d36, 'THE WILLOW');
    g.fillStyle(0x624d37);
    for (let x = 65; x < 270; x += 28) { g.fillRect(x, 320, 5, 34); g.fillRect(x - 3, 327, 11, 4); }
    const trees: [number, number][] = [[95,100],[175,200],[790,100],[850,260],[760,520],[160,550],[900,470]];
    trees.forEach(([x,y]) => {
      g.fillStyle(0x3c5a40, 0.25); g.fillEllipse(x, y + 15, 36, 18);
      g.fillStyle(0x31563c); g.fillCircle(x, y, 23);
      g.fillStyle(0x547a4e); g.fillRect(x - 13, y - 17, 25, 22);
      g.fillStyle(0x795b3e); g.fillRect(x - 4, y + 9, 8, 20);
      g.fillStyle(0x77915a); g.fillRect(x - 12, y - 12, 5, 5);
    });
    g.fillStyle(0x887c68); g.fillCircle(480, 335, 27);
    g.fillStyle(0x3d6260); g.fillCircle(480, 335, 19);
    g.fillStyle(0xdbc89c); g.fillRect(454, 306, 52, 6);
    for (let i = 0; i < 32; i++) {
      const x = 30 + ((i * 83) % 900), y = 40 + ((i * 47) % 560);
      g.fillStyle(i % 2 ? 0xe3b978 : 0xd98f88); g.fillRect(x, y, 3, 3);
    }
  }

  private drawBuilding(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, wall: number, roof: number, label: string) {
    g.fillStyle(0x344637, 0.25); g.fillRect(x + 8, y + h - 3, w, 18);
    g.fillStyle(wall); g.fillRect(x, y + 25, w, h - 25);
    g.fillStyle(roof); g.fillRect(x - 9, y, w + 18, 32);
    g.fillStyle(0xb58b5b); g.fillRect(x + 8, y + 32, w - 16, 5);
    g.fillStyle(0x46352c); g.fillRect(x + w / 2 - 12, y + h - 42, 24, 42);
    g.fillStyle(0xe6c17a); g.fillRect(x + 20, y + 48, 20, 18); g.fillRect(x + w - 40, y + 48, 20, 18);
    this.add.text(x + w / 2, y - 13, label, {
      fontFamily: 'DM Mono, monospace', fontSize: '10px', color: '#f3e7c9',
      backgroundColor: '#293b2e', padding: { x: 6, y: 4 },
    }).setOrigin(0.5).setDepth(10);
  }

  update() {
    if (!this.player || !this.keys) return;
    const speed = 150, body = this.player.body as Phaser.Physics.Arcade.Body;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown || this.keys.A.isDown) vx = -speed;
    else if (this.cursors.right.isDown || this.keys.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.keys.W.isDown) vy = -speed;
    else if (this.cursors.down.isDown || this.keys.S.isDown) vy = speed;
    if (vx && vy) { vx *= 0.707; vy *= 0.707; }
    body.setVelocity(vx, vy);
    if (vx !== 0) this.player.setFlipX(vx < 0);
    this.player.setDepth(this.player.y);
    let closest: NpcId | null = null, distance = 62;
    for (const npc of NPCS) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (d < distance) { distance = d; closest = npc.id; }
    }
    if (closest !== this.nearby) { this.nearby = closest; this.callbacks.onNearbyNpc(closest); }
    if (closest) {
      const person = NPCS.find((item) => item.id === closest)!;
      this.promptText.setPosition(person.x, person.y - 48).setVisible(true);
    } else {
      this.promptText.setVisible(false);
    }
    if (closest && Phaser.Input.Keyboard.JustDown(this.keys.E)) this.game.events.emit('npc-interact', closest);
  }
}
