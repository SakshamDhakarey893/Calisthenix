import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Props {
  tier: number; // 1 to 5
  isUpgrading?: boolean;
}

export function Hero3DCanvas({ tier, isUpgrading }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 450;

    // Scene with soft studio purple fog/depth
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x18142a, 0.07);

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 1.6, 5.0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.35, 0); // Focus on mid-torso for ideal full-body framing
    controls.minDistance = 2.8;
    controls.maxDistance = 7.0;
    controls.maxPolarAngle = Math.PI / 2 + 0.04; // Never clip underground
    controls.minPolarAngle = Math.PI / 6;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    // Studio Lighting setup matching reference photo
    const ambientLight = new THREE.AmbientLight(0x4338ca, 1.3);
    scene.add(ambientLight);

    // Key Light from upper front-left (gives muscle definition)
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.8);
    keyLight.position.set(2.8, 5.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    scene.add(keyLight);

    // Fill Light from front-right
    const fillLight = new THREE.DirectionalLight(0xfef08a, 1.2);
    fillLight.position.set(-2.5, 3.0, 3.0);
    scene.add(fillLight);

    // Purple / Lavender Studio Rim Light (accentuates contours like in the photo)
    const rimColor = tier === 5 ? 0x38bdf8 : tier === 4 ? 0xa855f7 : tier === 3 ? 0x8b5cf6 : tier === 2 ? 0x06b6d4 : 0xc084fc;
    const rimLight = new THREE.DirectionalLight(rimColor, 2.6);
    rimLight.position.set(-3.0, 4.0, -3.5);
    scene.add(rimLight);

    const backRim = new THREE.DirectionalLight(0x7c3aed, 1.6);
    backRim.position.set(3.0, 3.0, -3.0);
    scene.add(backRim);

    // Level-Up Ascension Pillar
    if (isUpgrading) {
      const beaconGeo = new THREE.CylinderGeometry(0.85, 1.4, 4.2, 32, 1, true);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 2.0;
      scene.add(beacon);
    }

    // Ground Platform & Studio Pedestal
    const groundGroup = new THREE.Group();
    scene.add(groundGroup);

    // Dark sleek pedestal disc
    const pedestalGeo = new THREE.CylinderGeometry(1.45, 1.55, 0.08, 36);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x18132c,
      roughness: 0.5,
      metalness: 0.6,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.04;
    pedestal.receiveShadow = true;
    groundGroup.add(pedestal);

    // Subtle Runic Energy Circle on ground
    const ringGeo = new THREE.RingGeometry(1.3, 1.42, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: rimColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const runeRing = new THREE.Mesh(ringGeo, ringMat);
    runeRing.rotation.x = -Math.PI / 2;
    runeRing.position.y = 0.003;
    groundGroup.add(runeRing);

    // Soft contact shadow circle directly under feet
    const shadowGeo = new THREE.CircleGeometry(0.75, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x070512,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    groundGroup.add(contactShadow);

    // ===== BUILD THE USER'S EXACT CHARACTER MODEL =====
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // --- MATERIALS ---
    // Skin: Vibrant golden-yellow mannequin skin tone matching user reference photo
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf9cb1c,
      roughness: 0.36,
      metalness: 0.06,
    });

    // Shorts: Charcoal grey athletic gym shorts
    const shortsMat = new THREE.MeshStandardMaterial({
      color: tier === 5 ? 0x1e1b4b : tier >= 3 ? 0x242832 : 0x3d444f,
      roughness: 0.82,
      metalness: 0.05,
    });

    // Shorts Waistband
    const waistbandMat = new THREE.MeshStandardMaterial({
      color: 0x2a2f38,
      roughness: 0.9,
      metalness: 0.04,
    });

    // Left Arm Compression Sleeve (Dark charcoal athletic compression fabric)
    const sleeveMat = new THREE.MeshStandardMaterial({
      color: tier >= 4 ? 0x1e1b4b : tier >= 2 ? 0x2e3440 : 0x474e59,
      roughness: 0.65,
      metalness: 0.08,
    });

    const sleeveCuffMat = new THREE.MeshStandardMaterial({
      color: 0x333942,
      roughness: 0.7,
      metalness: 0.1,
    });

    const mouthMat = new THREE.MeshBasicMaterial({
      color: 0x261d08,
    });

    const neonAccentMat = new THREE.MeshBasicMaterial({
      color: rimColor,
    });

    const metalArmorMat = new THREE.MeshStandardMaterial({
      color: tier >= 4 ? 0xf59e0b : 0x94a3b8,
      metalness: 0.85,
      roughness: 0.22,
    });

    // 1. FEET (Bare yellow athletic feet standing flat on ground at y=0)
    const createBareFoot = (xPos: number, isLeft: boolean) => {
      const footGroup = new THREE.Group();
      footGroup.position.set(xPos, 0, 0);
      footGroup.rotation.y = isLeft ? -0.12 : 0.12;

      // Heel and foot base
      const soleGeo = new THREE.BoxGeometry(0.105, 0.06, 0.24);
      const sole = new THREE.Mesh(soleGeo, skinMat);
      sole.position.set(0, 0.03, 0.02);
      sole.castShadow = true;
      footGroup.add(sole);

      // Instep / Arch curve
      const instepGeo = new THREE.CylinderGeometry(0.045, 0.055, 0.12, 12);
      const instep = new THREE.Mesh(instepGeo, skinMat);
      instep.rotation.x = Math.PI / 3;
      instep.position.set(0, 0.055, -0.01);
      footGroup.add(instep);

      // Defined toes (5 toes along the front)
      const toeWidths = [0.024, 0.021, 0.020, 0.018, 0.016];
      const toeLengths = [0.048, 0.046, 0.043, 0.039, 0.034];
      const startX = isLeft ? 0.038 : -0.038;
      const stepX = isLeft ? -0.019 : 0.019;

      for (let i = 0; i < 5; i++) {
        const toeGeo = new THREE.CylinderGeometry(toeWidths[i] / 2, toeWidths[i] / 2, toeLengths[i], 8);
        const toe = new THREE.Mesh(toeGeo, skinMat);
        toe.rotation.x = Math.PI / 2;
        toe.position.set(startX + i * stepX, 0.022, 0.14 + toeLengths[i] / 2);
        footGroup.add(toe);
      }

      return footGroup;
    };

    const leftFoot = createBareFoot(-0.16, true);
    heroGroup.add(leftFoot);

    const rightFoot = createBareFoot(0.16, false);
    heroGroup.add(rightFoot);

    // 2. LOWER LEGS & CALVES (Athletic calves with Achilles tendon)
    const createLowerLeg = (xPos: number) => {
      const legGroup = new THREE.Group();
      legGroup.position.set(xPos, 0, 0);

      // Ankle
      const ankleGeo = new THREE.CylinderGeometry(0.055, 0.058, 0.16, 16);
      const ankle = new THREE.Mesh(ankleGeo, skinMat);
      ankle.position.y = 0.14;
      legGroup.add(ankle);

      // Calf body (tapered shin)
      const shinGeo = new THREE.CylinderGeometry(0.082, 0.058, 0.52, 16);
      const shin = new THREE.Mesh(shinGeo, skinMat);
      shin.position.y = 0.46;
      shin.castShadow = true;
      legGroup.add(shin);

      // Calf muscle bulge (Gastrocnemius posterior curve)
      const calfBulgeGeo = new THREE.SphereGeometry(0.085, 16, 16);
      const calfBulge = new THREE.Mesh(calfBulgeGeo, skinMat);
      calfBulge.scale.set(1.0, 1.4, 1.2);
      calfBulge.position.set(0, 0.52, -0.02);
      legGroup.add(calfBulge);

      // Knee Patella
      const kneeGeo = new THREE.SphereGeometry(0.072, 16, 16);
      const knee = new THREE.Mesh(kneeGeo, skinMat);
      knee.scale.set(1.0, 1.15, 0.95);
      knee.position.set(0, 0.77, 0.02);
      legGroup.add(knee);

      return legGroup;
    };

    heroGroup.add(createLowerLeg(-0.16));
    heroGroup.add(createLowerLeg(0.16));

    // 3. UPPER LEGS & QUADRICEPS
    const createUpperLeg = (xPos: number, isLeft: boolean) => {
      const thighGroup = new THREE.Group();
      thighGroup.position.set(xPos, 0, 0);

      // Femur / main quad cylinder
      const thighGeo = new THREE.CylinderGeometry(0.142, 0.098, 0.52, 20);
      const thigh = new THREE.Mesh(thighGeo, skinMat);
      thigh.position.y = 1.06;
      thigh.castShadow = true;
      thighGroup.add(thigh);

      // Outer quad sweep (Vastus lateralis curve)
      const outerSweepGeo = new THREE.SphereGeometry(0.095, 16, 16);
      const outerSweep = new THREE.Mesh(outerSweepGeo, skinMat);
      outerSweep.scale.set(1.1, 1.6, 1.1);
      outerSweep.position.set(isLeft ? -0.045 : 0.045, 1.12, 0.01);
      thighGroup.add(outerSweep);

      // Teardrop quad muscle above knee (Vastus medialis)
      const teardropGeo = new THREE.SphereGeometry(0.065, 14, 14);
      const teardrop = new THREE.Mesh(teardropGeo, skinMat);
      teardrop.scale.set(1.0, 1.3, 1.0);
      teardrop.position.set(isLeft ? 0.04 : -0.04, 0.88, 0.035);
      thighGroup.add(teardrop);

      return thighGroup;
    };

    heroGroup.add(createUpperLeg(-0.16, true));
    heroGroup.add(createUpperLeg(0.16, false));

    // 4. CHARCOAL GYM SHORTS (Identical to user photo)
    const shortsGroup = new THREE.Group();
    heroGroup.add(shortsGroup);

    // Shorts leg cuffs (covering upper thighs)
    const shortLegGeo = new THREE.CylinderGeometry(0.175, 0.168, 0.28, 22);
    const leftShortLeg = new THREE.Mesh(shortLegGeo, shortsMat);
    leftShortLeg.position.set(-0.16, 1.38, 0);
    leftShortLeg.castShadow = true;
    shortsGroup.add(leftShortLeg);

    const rightShortLeg = new THREE.Mesh(shortLegGeo, shortsMat);
    rightShortLeg.position.set(0.16, 1.38, 0);
    rightShortLeg.castShadow = true;
    shortsGroup.add(rightShortLeg);

    // Pelvis / Glute section of shorts
    const pelvisGeo = new THREE.CylinderGeometry(0.315, 0.295, 0.24, 24);
    const pelvis = new THREE.Mesh(pelvisGeo, shortsMat);
    pelvis.position.y = 1.58;
    pelvis.castShadow = true;
    shortsGroup.add(pelvis);

    // Elastic Waistband with ribbed profile
    const waistbandGeo = new THREE.TorusGeometry(0.298, 0.026, 12, 32);
    const waistband = new THREE.Mesh(waistbandGeo, waistbandMat);
    waistband.rotation.x = Math.PI / 2;
    waistband.position.y = 1.70;
    shortsGroup.add(waistband);

    // Subtle front vertical fly seam
    const seamGeo = new THREE.BoxGeometry(0.012, 0.18, 0.02);
    const seam = new THREE.Mesh(seamGeo, waistbandMat);
    seam.position.set(0, 1.52, 0.30);
    shortsGroup.add(seam);

    // Tier 2+ Cyber stripes on shorts
    if (tier >= 2) {
      const stripeGeo = new THREE.BoxGeometry(0.018, 0.26, 0.04);
      const leftStripe = new THREE.Mesh(stripeGeo, neonAccentMat);
      leftStripe.position.set(-0.33, 1.45, 0);
      shortsGroup.add(leftStripe);

      const rightStripe = new THREE.Mesh(stripeGeo, neonAccentMat);
      rightStripe.position.set(0.33, 1.45, 0);
      shortsGroup.add(rightStripe);
    }

    // 5. TORSO: MUSCULAR WAIST, CHISELED 6-PACK ABS, CHEST, SERRATUS
    const torsoGroup = new THREE.Group();
    heroGroup.add(torsoGroup);

    // Lower abdomen / waist
    const waistGeo = new THREE.CylinderGeometry(0.28, 0.285, 0.30, 24);
    const waist = new THREE.Mesh(waistGeo, skinMat);
    waist.position.y = 1.85;
    waist.castShadow = true;
    torsoGroup.add(waist);

    // Upper Torso / Ribs / V-Taper (broadening to chest)
    const upperTorsoGeo = new THREE.CylinderGeometry(0.39, 0.28, 0.44, 24);
    const upperTorso = new THREE.Mesh(upperTorsoGeo, tier >= 3 ? metalArmorMat : skinMat);
    upperTorso.position.y = 2.18;
    upperTorso.castShadow = true;
    torsoGroup.add(upperTorso);

    // SCULPTED PECTORAL MUSCLES (Chest)
    const pecGeo = new THREE.BoxGeometry(0.165, 0.135, 0.075);
    const leftPec = new THREE.Mesh(pecGeo, skinMat);
    leftPec.position.set(-0.098, 2.22, 0.175);
    leftPec.rotation.y = 0.08;
    leftPec.rotation.z = 0.04;
    torsoGroup.add(leftPec);

    const rightPec = new THREE.Mesh(pecGeo, skinMat);
    rightPec.position.set(0.098, 2.22, 0.175);
    rightPec.rotation.y = -0.08;
    rightPec.rotation.z = -0.04;
    torsoGroup.add(rightPec);

    // Clavicles / Collarbones
    const clavicleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.32, 12);
    const clavicle = new THREE.Mesh(clavicleGeo, skinMat);
    clavicle.rotation.z = Math.PI / 2;
    clavicle.position.set(0, 2.34, 0.165);
    torsoGroup.add(clavicle);

    // SIX-PACK ABDOMINAL BLOCKS (3 rows of 2 chiseled muscles with center linea alba groove)
    const abYOffsets = [2.04, 1.94, 1.84];
    for (let row = 0; row < 3; row++) {
      const abGeo = new THREE.BoxGeometry(0.078, 0.062, 0.038);
      const y = abYOffsets[row];
      const zOffset = 0.17 - row * 0.015;

      const leftAb = new THREE.Mesh(abGeo, skinMat);
      leftAb.position.set(-0.052, y, zOffset);
      torsoGroup.add(leftAb);

      const rightAb = new THREE.Mesh(abGeo, skinMat);
      rightAb.position.set(0.052, y, zOffset);
      torsoGroup.add(rightAb);
    }

    // Serratus Anterior Ridges (along lateral ribcage)
    for (let s = 0; s < 3; s++) {
      const serratusGeo = new THREE.BoxGeometry(0.035, 0.024, 0.065);
      const sY = 2.08 - s * 0.07;

      const leftSerratus = new THREE.Mesh(serratusGeo, skinMat);
      leftSerratus.position.set(-0.25, sY, 0.08);
      leftSerratus.rotation.z = -0.25;
      torsoGroup.add(leftSerratus);

      const rightSerratus = new THREE.Mesh(serratusGeo, skinMat);
      rightSerratus.position.set(0.25, sY, 0.08);
      rightSerratus.rotation.z = 0.25;
      torsoGroup.add(rightSerratus);
    }

    // Trapezius muscles (sloping neck-to-shoulder contour)
    const trapGeo = new THREE.ConeGeometry(0.22, 0.20, 16);
    const traps = new THREE.Mesh(trapGeo, skinMat);
    traps.position.set(0, 2.36, -0.04);
    traps.rotation.x = -0.15;
    torsoGroup.add(traps);

    // Tier 3+ Core Rune / Crest on chest
    if (tier >= 3) {
      const coreRuneGeo = new THREE.OctahedronGeometry(0.085);
      const coreRune = new THREE.Mesh(coreRuneGeo, neonAccentMat);
      coreRune.position.set(0, 2.22, 0.22);
      torsoGroup.add(coreRune);
    }

    // 6. NECK & SMOOTH YELLOW MANNEQUIN HEAD (Matching reference photo)
    const neckGeo = new THREE.CylinderGeometry(0.098, 0.12, 0.18, 20);
    const neck = new THREE.Mesh(neckGeo, skinMat);
    neck.position.y = 2.45;
    neck.castShadow = true;
    torsoGroup.add(neck);

    // Oval Mannequin Head (Smooth bald yellow egg head)
    const headGeo = new THREE.SphereGeometry(0.215, 32, 32);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.scale.set(0.86, 1.15, 0.95);
    head.position.set(0, 2.68, 0.01);
    head.castShadow = true;
    torsoGroup.add(head);

    // Stylized Mouth Slit (Identical to user photo: clean subtle dark horizontal line)
    const mouthGeo = new THREE.BoxGeometry(0.075, 0.007, 0.02);
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 2.58, 0.20);
    torsoGroup.add(mouth);

    // Tier 4/5 Crown / Helm Wings
    if (tier >= 4) {
      const crownGeo = new THREE.TorusGeometry(0.23, 0.025, 8, 24);
      const crown = new THREE.Mesh(crownGeo, metalArmorMat);
      crown.rotation.x = Math.PI / 2;
      crown.position.set(0, 2.82, 0);
      torsoGroup.add(crown);

      const wingCrestGeo = new THREE.ConeGeometry(0.055, 0.38, 8);
      const leftWingCrest = new THREE.Mesh(wingCrestGeo, metalArmorMat);
      leftWingCrest.position.set(-0.24, 2.92, -0.04);
      leftWingCrest.rotation.z = -0.65;
      torsoGroup.add(leftWingCrest);

      const rightWingCrest = new THREE.Mesh(wingCrestGeo, metalArmorMat);
      rightWingCrest.position.set(0.24, 2.92, -0.04);
      rightWingCrest.rotation.z = 0.65;
      torsoGroup.add(rightWingCrest);
    }

    // 7. SHOULDERS & ARMS
    // LEFT ARM: With Charcoal Compression Sleeve (from bicep down to wrist) & BARE YELLOW HAND
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.43, 2.26, 0);
    torsoGroup.add(leftArmGroup);

    // Left Deltoid (Shoulder muscle)
    const deltoidGeo = new THREE.SphereGeometry(0.13, 20, 20);
    const leftDeltoid = new THREE.Mesh(deltoidGeo, tier >= 3 ? metalArmorMat : skinMat);
    leftDeltoid.position.set(0, 0, 0);
    leftArmGroup.add(leftDeltoid);

    // Sleeve Top Seam Ring
    const sleeveTopGeo = new THREE.TorusGeometry(0.084, 0.012, 10, 24);
    const sleeveTop = new THREE.Mesh(sleeveTopGeo, sleeveCuffMat);
    sleeveTop.rotation.x = Math.PI / 2;
    sleeveTop.position.set(-0.035, -0.15, 0.02);
    leftArmGroup.add(sleeveTop);

    // Left Bicep / Upper Arm (Covered in charcoal sleeve)
    const upperArmGeo = new THREE.CylinderGeometry(0.084, 0.074, 0.32, 20);
    const leftUpperArm = new THREE.Mesh(upperArmGeo, sleeveMat);
    leftUpperArm.position.set(-0.045, -0.30, 0.03);
    leftUpperArm.rotation.z = -0.12;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);

    // Left Elbow
    const elbowGeo = new THREE.SphereGeometry(0.074, 16, 16);
    const leftElbow = new THREE.Mesh(elbowGeo, sleeveMat);
    leftElbow.position.set(-0.075, -0.47, 0.04);
    leftArmGroup.add(leftElbow);

    // Left Forearm (Covered in charcoal sleeve)
    const forearmGeo = new THREE.CylinderGeometry(0.074, 0.062, 0.36, 20);
    const leftForearm = new THREE.Mesh(forearmGeo, sleeveMat);
    leftForearm.position.set(-0.088, -0.66, 0.05);
    leftForearm.rotation.x = -0.06;
    leftForearm.castShadow = true;
    leftArmGroup.add(leftForearm);

    // Sleeve Wrist Cuff
    const sleeveCuffGeo = new THREE.TorusGeometry(0.064, 0.012, 10, 24);
    const sleeveCuff = new THREE.Mesh(sleeveCuffGeo, sleeveCuffMat);
    sleeveCuff.rotation.x = Math.PI / 2;
    sleeveCuff.position.set(-0.092, -0.83, 0.06);
    leftArmGroup.add(sleeveCuff);

    // Left Hand: BARE YELLOW SKIN (Relaxed hand with fingers beside thigh)
    const handGroup = new THREE.Group();
    handGroup.position.set(-0.095, -0.92, 0.06);
    leftArmGroup.add(handGroup);

    const palmGeo = new THREE.BoxGeometry(0.065, 0.09, 0.038);
    const leftPalm = new THREE.Mesh(palmGeo, skinMat);
    handGroup.add(leftPalm);

    // 4 relaxed fingers
    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.07, 8);
      const finger = new THREE.Mesh(fingerGeo, skinMat);
      finger.position.set(-0.02 + f * 0.014, -0.075, 0);
      handGroup.add(finger);
    }
    // Thumb
    const thumbGeo = new THREE.CylinderGeometry(0.01, 0.009, 0.055, 8);
    const leftThumb = new THREE.Mesh(thumbGeo, skinMat);
    leftThumb.rotation.z = 0.4;
    leftThumb.position.set(0.032, -0.025, 0.015);
    handGroup.add(leftThumb);

    // RIGHT ARM: BARE YELLOW ATHLETIC MUSCLE (Shoulder, Bicep, Forearm, Hand)
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.43, 2.26, 0);
    torsoGroup.add(rightArmGroup);

    // Right Deltoid
    const rightDeltoid = new THREE.Mesh(deltoidGeo, tier >= 3 ? metalArmorMat : skinMat);
    rightDeltoid.position.set(0, 0, 0);
    rightArmGroup.add(rightDeltoid);

    // Right Bicep (Bare yellow skin on Tier 1, sleeve on Tier 2+)
    const isRightSleeved = tier >= 2;
    const rightUpperArm = new THREE.Mesh(upperArmGeo, isRightSleeved ? sleeveMat : skinMat);
    rightUpperArm.position.set(0.045, -0.30, 0.03);
    rightUpperArm.rotation.z = 0.12;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);

    // Right Elbow
    const rightElbow = new THREE.Mesh(elbowGeo, isRightSleeved ? sleeveMat : skinMat);
    rightElbow.position.set(0.075, -0.47, 0.04);
    rightArmGroup.add(rightElbow);

    // Right Forearm
    const rightForearm = new THREE.Mesh(forearmGeo, isRightSleeved ? sleeveMat : skinMat);
    rightForearm.position.set(0.088, -0.66, 0.05);
    rightForearm.rotation.x = -0.06;
    rightForearm.castShadow = true;
    rightArmGroup.add(rightForearm);

    if (isRightSleeved) {
      const rightCuff = new THREE.Mesh(sleeveCuffGeo, sleeveCuffMat);
      rightCuff.rotation.x = Math.PI / 2;
      rightCuff.position.set(0.092, -0.83, 0.06);
      rightArmGroup.add(rightCuff);
    }

    // Right Hand: BARE YELLOW SKIN
    const rightHandGroup = new THREE.Group();
    rightHandGroup.position.set(0.095, -0.92, 0.06);
    rightArmGroup.add(rightHandGroup);

    const rightPalm = new THREE.Mesh(palmGeo, skinMat);
    rightHandGroup.add(rightPalm);

    for (let f = 0; f < 4; f++) {
      const fingerGeo = new THREE.CylinderGeometry(0.009, 0.008, 0.07, 8);
      const finger = new THREE.Mesh(fingerGeo, skinMat);
      finger.position.set(0.02 - f * 0.014, -0.075, 0);
      rightHandGroup.add(finger);
    }
    const rightThumb = new THREE.Mesh(thumbGeo, skinMat);
    rightThumb.rotation.z = -0.4;
    rightThumb.position.set(-0.032, -0.025, 0.015);
    rightHandGroup.add(rightThumb);

    // 8. TIER 2 - 5 UPGRADE ACCESSORIES (Armor, Weapons, Auras, Wings)
    // Tier 2: Cyber Eye Visor & Steel Blade
    if (tier === 2) {
      const visorGeo = new THREE.BoxGeometry(0.24, 0.04, 0.12);
      const visor = new THREE.Mesh(visorGeo, neonAccentMat);
      visor.position.set(0, 2.70, 0.18);
      torsoGroup.add(visor);

      const bladeGeo = new THREE.BoxGeometry(0.04, 0.85, 0.02);
      const blade = new THREE.Mesh(bladeGeo, metalArmorMat);
      blade.position.set(0.58, 1.45, 0.15);
      torsoGroup.add(blade);
    }

    // Tier 3: Spiked Pauldrons & Runic Broadsword
    if (tier === 3) {
      const pauldronGeo = new THREE.ConeGeometry(0.18, 0.32, 12);
      const leftPauldron = new THREE.Mesh(pauldronGeo, metalArmorMat);
      leftPauldron.position.set(-0.48, 2.38, 0);
      leftPauldron.rotation.z = 0.45;
      torsoGroup.add(leftPauldron);

      const rightPauldron = new THREE.Mesh(pauldronGeo, metalArmorMat);
      rightPauldron.position.set(0.48, 2.38, 0);
      rightPauldron.rotation.z = -0.45;
      torsoGroup.add(rightPauldron);

      const broadswordGeo = new THREE.BoxGeometry(0.09, 1.15, 0.03);
      const broadsword = new THREE.Mesh(broadswordGeo, metalArmorMat);
      broadsword.position.set(-0.25, 2.15, -0.22);
      broadsword.rotation.z = -0.6;
      torsoGroup.add(broadsword);
    }

    // Tier 4: Flowing Shadow Cape & Solar Flaming Blade
    if (tier >= 4) {
      const capeGeo = new THREE.PlaneGeometry(0.65, 1.35, 8, 8);
      const capeMat = new THREE.MeshStandardMaterial({
        color: 0x1e1035,
        roughness: 0.7,
        side: THREE.DoubleSide,
      });
      const cape = new THREE.Mesh(capeGeo, capeMat);
      cape.position.set(0, 1.85, -0.22);
      cape.rotation.x = 0.12;
      torsoGroup.add(cape);

      const flameBladeGeo = new THREE.BoxGeometry(0.06, 1.25, 0.025);
      const flameBladeMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
      });
      const flameBlade = new THREE.Mesh(flameBladeGeo, flameBladeMat);
      flameBlade.position.set(0.60, 1.60, 0.20);
      torsoGroup.add(flameBlade);
    }

    // Tier 5: Rotating Supernova Halo, Dual Energy Blades & Archangel Wings
    let halo: THREE.Mesh | null = null;
    let wingLeft: THREE.Group | null = null;
    let wingRight: THREE.Group | null = null;

    if (tier === 5) {
      const haloGeo = new THREE.TorusGeometry(0.36, 0.02, 16, 36);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: true,
      });
      halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      halo.position.set(0, 3.02, 0);
      torsoGroup.add(halo);

      const createEnergyWing = (isLeft: boolean) => {
        const wing = new THREE.Group();
        const wingMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.75,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending,
        });

        for (let feather = 0; feather < 5; feather++) {
          const fGeo = new THREE.ConeGeometry(0.05, 0.55 + feather * 0.12, 6);
          const fMesh = new THREE.Mesh(fGeo, wingMat);
          fMesh.position.set(
            (isLeft ? -1 : 1) * (0.15 + feather * 0.12),
            0.2 - feather * 0.08,
            feather * 0.03
          );
          fMesh.rotation.z = (isLeft ? 1 : -1) * (0.5 + feather * 0.22);
          wing.add(fMesh);
        }
        return wing;
      };

      wingLeft = createEnergyWing(true);
      wingLeft.position.set(-0.25, 2.25, -0.18);
      torsoGroup.add(wingLeft);

      wingRight = createEnergyWing(false);
      wingRight.position.set(0.25, 2.25, -0.18);
      torsoGroup.add(wingRight);
    }

    // Ambient floating energy particles for Tier 3+
    let particles: THREE.Points | null = null;
    if (tier >= 3) {
      const particleCount = tier === 5 ? 120 : tier === 4 ? 70 : 40;
      const particleGeo = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2.5;
        positions[i * 3 + 1] = Math.random() * 3.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const particleMat = new THREE.PointsMaterial({
        color: rimColor,
        size: 0.05,
        transparent: true,
        opacity: 0.85,
      });
      particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);
    }

    // Animation Loop
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Subtle breathing motion
      torsoGroup.position.y = Math.sin(elapsed * 2.2) * 0.012;
      waist.scale.set(1 + Math.sin(elapsed * 2.2) * 0.012, 1, 1 + Math.sin(elapsed * 2.2) * 0.012);

      // Rotating ground rune
      runeRing.rotation.z = elapsed * 0.25;

      // Tier 5 animated halo and wings flap
      if (halo) {
        halo.rotation.z = elapsed * 1.2;
      }
      if (wingLeft && wingRight) {
        wingLeft.rotation.y = Math.sin(elapsed * 3.0) * 0.25;
        wingRight.rotation.y = -Math.sin(elapsed * 3.0) * 0.25;
      }

      // Particle float motion
      if (particles) {
        const positions = particles.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < positions.length / 3; i++) {
          positions[i * 3 + 1] += 0.01;
          if (positions[i * 3 + 1] > 3.4) {
            positions[i * 3 + 1] = 0.1;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 340;
      const newHeight = container.clientHeight || 450;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [tier, autoRotate, isUpgrading]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 1.35, 0);
    }
  };

  return (
    <div className="hero-3d-wrapper">
      <div ref={containerRef} className="hero-3d-viewport" />

      {/* 3D Viewport HUD Overlay Controls */}
      <div className="hero-3d-hud">
        <div className="hud-badge">
          <span className="rotate-icon">🔄</span>
          <span>360° Drag &amp; Rotate</span>
        </div>

        <div className="hud-buttons">
          <button
            type="button"
            className={`hud-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle automatic turntable rotation"
          >
            {autoRotate ? '⏸ Spin: ON' : '▶ Spin: OFF'}
          </button>

          <button
            type="button"
            className="hud-btn reset-btn"
            onClick={handleResetCamera}
            title="Reset to front hero view"
          >
            ↺ Reset
          </button>
        </div>
      </div>
    </div>
  );
}
