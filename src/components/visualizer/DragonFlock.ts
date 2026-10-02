import * as THREE from 'three';
import { AudioMetrics } from '../../services/audioEngine';

/**
 * Procedural Articulated 3D Cyber Dragons with Flocking Physics
 * Audio-reactive flight paths, wing flapping, spine wave undulation, and emission flares.
 */

interface DragonSegment {
  mesh: THREE.Mesh;
  finMesh?: THREE.Mesh;
  relativeScale: number;
}

class ProceduralDragon {
  public group: THREE.Group;
  public isAlpha: boolean;
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public heading: THREE.Vector3;

  private spineSegments: DragonSegment[] = [];
  private leftWing: THREE.Group;
  private rightWing: THREE.Group;
  private headMesh: THREE.Mesh;
  private eyesLight: THREE.Mesh;
  private materials: THREE.MeshStandardMaterial[] = [];

  // Articulation history for smooth serpentine follow-through
  private historyPositions: THREE.Vector3[] = [];
  private historyRotations: THREE.Quaternion[] = [];
  private segmentCount = 20;
  private segmentSpacing = 3.6;

  // Base flight properties
  private baseSpeed = 1.4;
  private flightPhase = Math.random() * 100;
  private targetPoint: THREE.Vector3;
  private primaryColor: THREE.Color;
  private emissiveColor: THREE.Color;

  constructor(isAlpha = false, colorScheme: { primary: number; emissive: number }) {
    this.isAlpha = isAlpha;
    this.group = new THREE.Group();
    this.position = new THREE.Vector3(
      (Math.random() - 0.5) * 200,
      Math.random() * 80 + 30,
      (Math.random() - 0.5) * 300 - 150
    );
    this.velocity = new THREE.Vector3(0, 0, -1).multiplyScalar(this.baseSpeed);
    this.heading = new THREE.Vector3(0, 0, -1);
    this.targetPoint = new THREE.Vector3(0, 50, -300);

    this.primaryColor = new THREE.Color(colorScheme.primary);
    this.emissiveColor = new THREE.Color(colorScheme.emissive);

    // Initialize history buffer
    for (let i = 0; i < this.segmentCount * 4; i++) {
      this.historyPositions.push(this.position.clone().add(new THREE.Vector3(0, 0, i * 1.5)));
      this.historyRotations.push(new THREE.Quaternion());
    }

    const scaleFactor = isAlpha ? 1.4 : 0.95;

    // 1. Dragon Head
    const headGeo = new THREE.ConeGeometry(2.4 * scaleFactor, 7.5 * scaleFactor, 5);
    headGeo.rotateX(Math.PI / 2);
    const headMat = new THREE.MeshStandardMaterial({
      color: this.primaryColor,
      roughness: 0.25,
      metalness: 0.85,
      emissive: this.emissiveColor,
      emissiveIntensity: 0.8
    });
    this.materials.push(headMat);
    this.headMesh = new THREE.Mesh(headGeo, headMat);

    // Glowing Dragon Horns / Crest
    const hornGeo = new THREE.ConeGeometry(0.8 * scaleFactor, 4.5 * scaleFactor, 4);
    hornGeo.rotateX(-Math.PI / 4);
    const hornMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: this.emissiveColor,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9
    });
    this.materials.push(hornMat);

    const leftHorn = new THREE.Mesh(hornGeo, hornMat);
    leftHorn.position.set(-1.2 * scaleFactor, 1.4 * scaleFactor, -1.0 * scaleFactor);
    leftHorn.rotation.z = -0.3;
    this.headMesh.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeo, hornMat);
    rightHorn.position.set(1.2 * scaleFactor, 1.4 * scaleFactor, -1.0 * scaleFactor);
    rightHorn.rotation.z = 0.3;
    this.headMesh.add(rightHorn);

    // Glowing Eyes
    const eyeGeo = new THREE.SphereGeometry(0.55 * scaleFactor, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff
    });
    this.eyesLight = new THREE.Mesh(eyeGeo, eyeMat);
    this.eyesLight.position.set(0, 0.8 * scaleFactor, 1.8 * scaleFactor);
    this.headMesh.add(this.eyesLight);

    this.group.add(this.headMesh);

    // 2. Articulated Spine Segments & Dorsal Fins
    for (let i = 0; i < this.segmentCount; i++) {
      const t = i / this.segmentCount;
      // Body width envelope (tapers from thorax to slender tail)
      const envelope = Math.sin((t + 0.15) * Math.PI) * (1.0 - t * 0.45);
      const segmentScale = Math.max(0.3, envelope) * scaleFactor;

      const segGeo = new THREE.CylinderGeometry(
        1.8 * segmentScale,
        2.2 * segmentScale,
        this.segmentSpacing * 0.95,
        6
      );
      segGeo.rotateX(Math.PI / 2);

      const segMat = new THREE.MeshStandardMaterial({
        color: this.primaryColor,
        roughness: 0.3,
        metalness: 0.8,
        emissive: this.emissiveColor,
        emissiveIntensity: 0.5 + (1.0 - t) * 0.5
      });
      this.materials.push(segMat);

      const segMesh = new THREE.Mesh(segGeo, segMat);

      // Crystalline Dorsal Fin Plate
      const finGeo = new THREE.BufferGeometry();
      const finWidth = 0.3 * segmentScale;
      const finHeight = 3.2 * segmentScale;
      const finLength = this.segmentSpacing * 0.8;

      const vertices = new Float32Array([
        -finWidth, 0, -finLength * 0.5,
         finWidth, 0, -finLength * 0.5,
         0, finHeight, 0,

         finWidth, 0, finLength * 0.5,
        -finWidth, 0, finLength * 0.5,
         0, finHeight, 0
      ]);
      finGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      finGeo.computeVertexNormals();

      const finMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: this.emissiveColor,
        emissiveIntensity: 1.2,
        roughness: 0.1,
        metalness: 0.5,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      this.materials.push(finMat);

      const finMesh = new THREE.Mesh(finGeo, finMat);
      finMesh.position.y = 1.6 * segmentScale;
      segMesh.add(finMesh);

      this.group.add(segMesh);
      this.spineSegments.push({
        mesh: segMesh,
        finMesh,
        relativeScale: segmentScale
      });
    }

    // 3. Articulated Cybernetic Wings (Attached at Thorax segment ~2)
    const createWing = (isLeft: boolean) => {
      const wingGroup = new THREE.Group();
      const wingSpan = 22 * scaleFactor;
      const wingBoneGeo = new THREE.CylinderGeometry(0.4 * scaleFactor, 0.2 * scaleFactor, wingSpan, 5);
      wingBoneGeo.rotateZ(Math.PI / 2);
      const boneMat = new THREE.MeshStandardMaterial({
        color: 0x111122,
        roughness: 0.2,
        metalness: 0.9
      });
      const bone = new THREE.Mesh(wingBoneGeo, boneMat);
      bone.position.x = (isLeft ? -wingSpan : wingSpan) * 0.5;
      wingGroup.add(bone);

      // Translucent Cyber Wing Membrane
      const membraneGeo = new THREE.BufferGeometry();
      const dir = isLeft ? -1 : 1;
      const memVerts = new Float32Array([
        0, 0, 0,
        dir * wingSpan * 0.5, 1.5 * scaleFactor, -5 * scaleFactor,
        dir * wingSpan, 0, -10 * scaleFactor,

        0, 0, 0,
        dir * wingSpan, 0, -10 * scaleFactor,
        dir * wingSpan * 0.3, -1.0 * scaleFactor, -14 * scaleFactor
      ]);
      membraneGeo.setAttribute('position', new THREE.BufferAttribute(memVerts, 3));
      membraneGeo.computeVertexNormals();

      const membraneMat = new THREE.MeshStandardMaterial({
        color: this.primaryColor,
        emissive: this.emissiveColor,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.65,
        roughness: 0.2,
        metalness: 0.7,
        side: THREE.DoubleSide
      });
      this.materials.push(membraneMat);
      const membrane = new THREE.Mesh(membraneGeo, membraneMat);
      wingGroup.add(membrane);

      return wingGroup;
    };

    this.leftWing = createWing(true);
    this.rightWing = createWing(false);

    // Attach wings to head/chest area
    this.headMesh.add(this.leftWing);
    this.headMesh.add(this.rightWing);
    this.leftWing.position.set(-1.8 * scaleFactor, 0.4 * scaleFactor, -2.5 * scaleFactor);
    this.rightWing.position.set(1.8 * scaleFactor, 0.4 * scaleFactor, -2.5 * scaleFactor);
  }

  public update(
    time: number,
    metrics: AudioMetrics,
    alphaLeaderPos?: THREE.Vector3,
    alphaLeaderVel?: THREE.Vector3
  ) {
    this.flightPhase += 0.016;

    // Flight Speed boost on audio transients / beat
    const beatSurge = metrics.beatStrength * 2.2;
    const currentSpeed = (this.baseSpeed + beatSurge) * (this.isAlpha ? 1.15 : 1.0);

    // 1. Steering & Flocking Trajectory
    if (this.isAlpha) {
      // Alpha dragon follows sweeping Lissajous 3D curves over the sunset horizon
      const radiusX = 260;
      const radiusZ = 240;
      const targetX = Math.sin(time * 0.22) * radiusX;
      const targetY = 55 + Math.sin(time * 0.38) * 35 + metrics.bass * 25;
      const targetZ = -300 + Math.cos(time * 0.18) * radiusZ;
      this.targetPoint.set(targetX, targetY, targetZ);
    } else if (alphaLeaderPos && alphaLeaderVel) {
      // Companion dragons apply Boids Flocking (Cohesion, Alignment with offset)
      const offsetDist = this.flightPhase % 2 === 0 ? 45 : -45;
      this.targetPoint.copy(alphaLeaderPos)
        .add(new THREE.Vector3(offsetDist, (Math.sin(this.flightPhase) - 0.2) * 20, 25));
    }

    // Steering Force
    const desired = new THREE.Vector3().subVectors(this.targetPoint, this.position);
    desired.normalize().multiplyScalar(currentSpeed);

    const steer = new THREE.Vector3().subVectors(desired, this.velocity).multiplyScalar(0.04);
    this.velocity.add(steer).clampLength(0.5, 4.5);
    this.position.add(this.velocity);

    // Heading and Rotation (Pitch, Yaw, Roll Banking)
    this.heading.copy(this.velocity).normalize();

    // Serpentine Swimming Wave offset for head
    const waveFreq = 2.8 + metrics.bass * 2.0;
    const waveAmp = 0.8 + metrics.mid * 0.6;
    const sideSway = Math.sin(time * waveFreq + this.flightPhase) * waveAmp;

    const lookTarget = this.position.clone().add(this.heading.clone().multiplyScalar(10));
    lookTarget.x += sideSway;

    // Update Head transform
    this.headMesh.position.copy(this.position);
    this.headMesh.lookAt(lookTarget);

    // Banking Roll into turns
    const lateralTurn = -this.velocity.x * 0.35;
    this.headMesh.rotateZ(lateralTurn);

    // Record position & rotation into history
    this.historyPositions.unshift(this.position.clone());
    this.historyRotations.unshift(this.headMesh.quaternion.clone());

    if (this.historyPositions.length > this.segmentCount * 4) {
      this.historyPositions.pop();
      this.historyRotations.pop();
    }

    // 2. Articulated Spine Undulation
    const stepLag = 2;
    for (let i = 0; i < this.spineSegments.length; i++) {
      const histIndex = Math.min((i + 1) * stepLag, this.historyPositions.length - 1);
      const segPos = this.historyPositions[histIndex];
      const segQuat = this.historyRotations[histIndex];

      const segment = this.spineSegments[i];
      if (segPos && segQuat) {
        segment.mesh.position.copy(segPos);
        segment.mesh.quaternion.copy(segQuat);

        // Sinusoidal wave undulation along the spine
        const waveOffset = Math.sin(time * waveFreq - i * 0.32) * (0.8 + metrics.bass * 1.5);
        segment.mesh.position.y += waveOffset * 0.4;

        // Dorsal fin flared angle on audio beat
        if (segment.finMesh) {
          const finFlare = 1.0 + (metrics.beatStrength * 0.6) + (metrics.treble * 0.4);
          segment.finMesh.scale.set(1.0, finFlare, 1.0);
        }
      }
    }

    // 3. Wing Flapping Physics
    const tempoBoost = metrics.beatStrength * 2.5;
    const flapFreq = 4.2 + tempoBoost + (metrics.beatStrength * 5.0);
    const flapAmp = 0.55 + (metrics.mid * 0.4) + (metrics.beatStrength * 0.4);
    const flapAngle = Math.sin(time * flapFreq) * flapAmp;

    this.leftWing.rotation.z = flapAngle;
    this.rightWing.rotation.z = -flapAngle;

    // Wing fold during downstroke
    this.leftWing.rotation.y = Math.sin(time * flapFreq) * 0.2;
    this.rightWing.rotation.y = -Math.sin(time * flapFreq) * 0.2;

    // 4. Audio-Reactive Glow & Emission Intensity
    const emissiveBoost = 0.7 + (metrics.beatStrength * 2.8) + (metrics.bass * 1.2);
    for (let m = 0; m < this.materials.length; m++) {
      this.materials[m].emissiveIntensity = emissiveBoost;
    }
  }
}

export class DragonFlock {
  public group: THREE.Group;
  public dragons: ProceduralDragon[] = [];

  constructor() {
    this.group = new THREE.Group();

    // 1. Alpha Dragon (Majestic Cyan & Electric Magenta)
    const alphaDragon = new ProceduralDragon(true, {
      primary: 0x0a1832,
      emissive: 0x06b6d4 // Cyan glow
    });
    this.dragons.push(alphaDragon);
    this.group.add(alphaDragon.group);

    // 2. Companion Dragon 1 (Sunset Fuchsia / Orange)
    const betaDragon = new ProceduralDragon(false, {
      primary: 0x24061a,
      emissive: 0xf43f5e // Sunset pink/fuchsia
    });
    this.dragons.push(betaDragon);
    this.group.add(betaDragon.group);

    // 3. Companion Dragon 2 (Deep Violet / Solar Amber)
    const gammaDragon = new ProceduralDragon(false, {
      primary: 0x140a28,
      emissive: 0xa855f7 // Violet
    });
    this.dragons.push(gammaDragon);
    this.group.add(gammaDragon.group);
  }

  public getAlphaPosition(): THREE.Vector3 {
    return this.dragons[0] ? this.dragons[0].position : new THREE.Vector3(0, 50, -200);
  }

  public getAlphaHeading(): THREE.Vector3 {
    return this.dragons[0] ? this.dragons[0].heading : new THREE.Vector3(0, 0, -1);
  }

  public update(time: number, metrics: AudioMetrics) {
    const alpha = this.dragons[0];
    if (alpha) {
      alpha.update(time, metrics);
    }

    for (let i = 1; i < this.dragons.length; i++) {
      this.dragons[i].update(
        time,
        metrics,
        alpha ? alpha.position : undefined,
        alpha ? alpha.velocity : undefined
      );
    }
  }
}
