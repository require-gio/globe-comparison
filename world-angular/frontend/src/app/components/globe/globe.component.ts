import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, ComponentRef, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as THREE from 'three';
import ThreeGlobe from 'three-globe';
import { CountryGeoJSON } from '../../models/country.model';
import { ApiService } from '../../services/api.service';
import { CountryStateService } from '../../services/country-state.service';
import { CountryCacheService } from '../../services/country-cache.service';
import { CountryInfoComponent } from '../country-info/country-info.component';

@Component({
  selector: 'app-globe',
  templateUrl: './globe.component.html',
  styleUrls: ['./globe.component.scss'],
  standalone: false
})
export class GlobeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('globeContainer', { static: false }) globeContainer!: ElementRef<HTMLDivElement>;

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private globe!: ThreeGlobe;
  private animationId: number = 0;

  // Mouse interaction state
  private isDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private rotationVelocity = { x: 0, y: 0 };
  private readonly ROTATION_SPEED = 0.005;
  private readonly MOMENTUM_DECAY = 0.95;

  // Hover state
  private hoverSubject = new Subject<{ code: string | null; position: { x: number; y: number } | null }>();
  private overlayRef: OverlayRef | null = null;
  private countryInfoRef: ComponentRef<CountryInfoComponent> | null = null;
  private currentHoveredCountry: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private countryStateService: CountryStateService,
    private cacheService: CountryCacheService,
    private overlay: Overlay,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // Setup hover debouncing
    this.hoverSubject.pipe(
      debounceTime(200),
      takeUntil(this.destroy$)
    ).subscribe(({ code, position }) => {
      this.handleHover(code, position);
    });
  }

  ngAfterViewInit(): void {
    this.initScene();
    this.loadGeoJSON();
    this.animate();
    this.setupMouseHandlers();
    this.setupResizeHandler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  private initScene(): void {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0f);

    // Setup camera
    const container = this.globeContainer.nativeElement;
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 300;

    // Setup renderer with enhanced settings
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap at 2x for performance
    this.renderer.setClearColor(0x0a0a0f, 1);
    container.appendChild(this.renderer.domElement);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Primary directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    this.scene.add(directionalLight);
    
    // Secondary fill light
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
  }

  private loadGeoJSON(): void {
    this.http.get<CountryGeoJSON>('/assets/countries-110m.geojson').subscribe({
      next: (data) => {
        this.initGlobe(data);
      },
      error: (error) => {
        console.error('Failed to load GeoJSON:', error);
      }
    });
  }

  private initGlobe(geoJson: CountryGeoJSON): void {
    this.globe = new ThreeGlobe()
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .polygonsData(geoJson.features)
      .polygonCapColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry 
          ? 'rgba(255, 215, 0, 0.9)'  // Bright gold on hover
          : 'rgba(70, 130, 180, 0.2)'; // Subtle steel blue default
      })
      .polygonSideColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry
          ? 'rgba(255, 165, 0, 0.8)'  // Orange sides on hover
          : 'rgba(50, 100, 150, 0.1)';
      })
      .polygonStrokeColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry
          ? '#FFD700'  // Gold stroke on hover
          : '#4682B4';  // Steel blue stroke default
      })
      .polygonAltitude((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry ? 0.05 : 0.01; // More dramatic lift
      })
      .atmosphereColor('#3a82f7')
      .atmosphereAltitude(0.15);

    this.scene.add(this.globe);
  }

  private updateGlobeColors(): void {
    if (!this.globe) return;
    
    // Re-apply the color/altitude functions to trigger visual update
    this.globe
      .polygonCapColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry 
          ? 'rgba(255, 215, 0, 0.9)'  // Bright gold on hover
          : 'rgba(70, 130, 180, 0.2)'; // Subtle steel blue default
      })
      .polygonSideColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry
          ? 'rgba(255, 165, 0, 0.8)'  // Orange sides on hover
          : 'rgba(50, 100, 150, 0.1)';
      })
      .polygonStrokeColor((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry
          ? '#FFD700'  // Gold stroke on hover
          : '#4682B4';  // Steel blue stroke default
      })
      .polygonAltitude((d: any) => {
        const code = d.properties?.ISO_A2;
        return code === this.currentHoveredCountry ? 0.05 : 0.01; // More dramatic lift
      });
  }

  private handleHover(code: string | null, position: { x: number; y: number } | null): void {
    if (code && position) {
      const previousCountry = this.currentHoveredCountry;
      this.currentHoveredCountry = code;
      
      // Trigger visual update if country changed
      if (previousCountry !== code && this.globe) {
        this.updateGlobeColors();
      }
      
      // Check cache first
      const cachedCountry = this.cacheService.get(code);
      
      if (cachedCountry) {
        this.showPopover(position, cachedCountry, false, null);
      } else {
        // Not in cache, fetch from API
        this.showPopover(position, null, true, null);
        
        this.apiService.getCountry(code).subscribe({
          next: (country) => {
            this.cacheService.set(code, country);
            this.showPopover(position, country, false, null);
          },
          error: (error) => {
            this.showPopover(position, null, false, 'Information unavailable');
          }
        });
      }
    } else {
      // Clear hover
      if (this.currentHoveredCountry !== null) {
        this.currentHoveredCountry = null;
        
        // Trigger visual update to remove highlighting
        this.updateGlobeColors();
      }
      this.hidePopover();
    }
  }

  private showPopover(
    position: { x: number; y: number } | null, 
    country: any, 
    isLoading: boolean, 
    error: string | null
  ): void {
    if (!position) return;

    // Create overlay if it doesn't exist
    if (!this.overlayRef) {
      const positionStrategy = this.overlay.position()
        .global()
        .left(`${position.x + 10}px`)
        .top(`${position.y + 10}px`);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.close(),
        hasBackdrop: false
      });

      const portal = new ComponentPortal(CountryInfoComponent);
      this.countryInfoRef = this.overlayRef.attach(portal);
    }

    // Update component inputs
    if (this.countryInfoRef) {
      this.countryInfoRef.instance.country = country;
      this.countryInfoRef.instance.isLoading = isLoading;
      this.countryInfoRef.instance.error = error;
      this.countryInfoRef.changeDetectorRef.detectChanges();
    }

    // Update position
    if (this.overlayRef) {
      this.overlayRef.updatePositionStrategy(
        this.overlay.position()
          .global()
          .left(`${position.x + 10}px`)
          .top(`${position.y + 10}px`)
      );
    }
  }

  private hidePopover(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
      this.countryInfoRef = null;
    }
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Apply momentum rotation
    if (!this.isDragging && (Math.abs(this.rotationVelocity.x) > 0.0001 || Math.abs(this.rotationVelocity.y) > 0.0001)) {
      this.globe.rotation.y += this.rotationVelocity.x;
      this.globe.rotation.x += this.rotationVelocity.y;

      // Apply decay
      this.rotationVelocity.x *= this.MOMENTUM_DECAY;
      this.rotationVelocity.y *= this.MOMENTUM_DECAY;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private setupMouseHandlers(): void {
    const canvas = this.renderer.domElement;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.previousMousePosition = {
        x: event.clientX,
        y: event.clientY
      };
      this.rotationVelocity = { x: 0, y: 0 };
    });

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      const mousePosition = {
        x: event.clientX,
        y: event.clientY
      };

      // Handle drag rotation
      if (this.isDragging) {
        const deltaX = event.clientX - this.previousMousePosition.x;
        const deltaY = event.clientY - this.previousMousePosition.y;

        this.globe.rotation.y += deltaX * this.ROTATION_SPEED;
        this.globe.rotation.x += deltaY * this.ROTATION_SPEED;

        // Store velocity for momentum
        this.rotationVelocity.x = deltaX * this.ROTATION_SPEED;
        this.rotationVelocity.y = deltaY * this.ROTATION_SPEED;

        this.previousMousePosition = {
          x: event.clientX,
          y: event.clientY
        };
        
        // Hide popover while dragging
        this.hidePopover();
        return;
      }

      // Handle hover detection (only when not dragging)
      // Safety check: ensure globe is initialized
      if (!this.globe) return;
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, this.camera);
      
      // Intersect with all children of the globe recursively
      const intersects = raycaster.intersectObjects(this.globe.children, true);

      let foundCountry = false;
      
      if (intersects.length > 0) {
        for (const intersect of intersects) {
          const obj: any = intersect.object;
          

          // NEW APPROACH: Check if this is a ConicPolygonGeometry (country polygon)
          if (obj.geometry && obj.geometry.type === 'ConicPolygonGeometry') {
            // The parent Group should have the __data with nested data.properties
            if (obj.parent && (obj.parent as any).__data) {
              const parentData = (obj.parent as any).__data;
              // The structure is: parent.__data.data.properties.ISO_A2
              if (parentData.data && parentData.data.properties && parentData.data.properties.ISO_A2) {
                const code = parentData.data.properties.ISO_A2;
                
                if (code !== this.currentHoveredCountry) {
                  this.ngZone.run(() => {
                    this.hoverSubject.next({ code, position: mousePosition });
                  });
                }
                foundCountry = true;
                break;
              }
            }
          }
        }
      }
      
      if (!foundCountry && this.currentHoveredCountry) {
        this.ngZone.run(() => {
          this.hoverSubject.next({ code: null, position: null });
        });
      }
    });

    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.ngZone.run(() => {
        this.hoverSubject.next({ code: null, position: null });
      });
    });
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      const container = this.globeContainer.nativeElement;
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });
  }
}
