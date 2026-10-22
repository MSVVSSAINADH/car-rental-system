package com.carrental.configuration;

import com.carrental.entity.Car;
import com.carrental.entity.Review;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Seeds the demo data and keeps the fleet in sync with the canonical 30-car
 * catalogue.
 *
 * <p>The fleet is reconciled on every start instead of being inserted only when
 * the table is empty: cars are matched on brand + model, missing cars are added
 * and cars that are no longer part of the catalogue are removed. A car that
 * already has bookings is never deleted (bookings hold a foreign key to it);
 * it is taken off the fleet by marking it unavailable so booking history stays
 * intact.</p>
 */
@Component
public class DataSeeder implements CommandLineRunner {

    /** Single source of truth for the fleet taxonomy. */
    public static final List<String> CATEGORIES = List.of(
            "Budget", "Mid-range", "Family", "SUV", "Electric", "Premium");

    private static final List<FleetEntry> FLEET = List.of(
            // Budget (8)
            entry("Maruti Suzuki", "Swift", "Red", "Manual", "Petrol", 2024, 2200, 5, "Budget",
                    "Fun-to-drive hatchback with a peppy petrol engine and excellent mileage."),
            entry("Maruti Suzuki", "WagonR", "White", "Manual", "Petrol", 2023, 2000, 5, "Budget",
                    "Tall-boy hatchback with generous headroom and easy city driving."),
            entry("Maruti Suzuki", "Alto K10", "Silver", "Manual", "Petrol", 2024, 1800, 5, "Budget",
                    "India's most affordable hatchback for quick city errands."),
            entry("Maruti Suzuki", "Celerio", "Grey", "Automatic", "Petrol", 2024, 2100, 5, "Budget",
                    "Compact automatic hatchback with class-leading fuel efficiency."),
            entry("Tata", "Tiago", "Blue", "Manual", "Petrol", 2024, 2300, 5, "Budget",
                    "Safe, stylish hatchback with a punchy petrol engine."),
            entry("Hyundai", "Grand i10 Nios", "White", "Manual", "Petrol", 2023, 2400, 5, "Budget",
                    "Refined city hatchback with a feature-rich cabin."),
            entry("Maruti Suzuki", "Dzire", "Silver", "Manual", "Petrol", 2024, 2800, 5, "Budget",
                    "India's favorite sedan. Fuel efficient and spacious."),
            entry("Hyundai", "Aura", "Silver", "Manual", "Petrol", 2024, 2700, 5, "Budget",
                    "Brilliant compact sedan with modern styling and features."),

            // Mid-range (9)
            entry("Maruti Suzuki", "Baleno", "Blue", "Automatic", "Petrol", 2024, 3000, 5, "Mid-range",
                    "Premium hatchback with a spacious cabin and smooth automatic gearbox."),
            entry("Honda", "City", "Grey", "Automatic", "Petrol", 2024, 4000, 5, "Mid-range",
                    "The original sedan. Class, comfort, and performance in one."),
            entry("Maruti Suzuki", "Brezza", "Grey", "Automatic", "Petrol", 2024, 3800, 5, "Mid-range",
                    "Hot and Techy. Compact SUV for the modern generation."),
            entry("Tata", "Nexon", "Blue", "Manual", "Petrol", 2024, 3500, 5, "Mid-range",
                    "5-Star safety rated compact SUV with bold design and premium features."),
            entry("Hyundai", "Venue", "Red", "Automatic", "Petrol", 2024, 3400, 5, "Mid-range",
                    "Compact SUV with connected tech and a turbo-petrol option."),
            entry("Kia", "Sonet", "Red", "Automatic", "Petrol", 2024, 3600, 5, "Mid-range",
                    "Bold and beautiful compact SUV with segment-first features."),
            entry("Maruti Suzuki", "Fronx", "White", "Automatic", "Petrol", 2024, 3300, 5, "Mid-range",
                    "Coupe-styled crossover that blends SUV stance with hatchback agility."),
            entry("Hyundai", "Creta", "White", "Automatic", "Diesel", 2024, 4500, 5, "Mid-range",
                    "The ultimate mid-size SUV. Premium interiors and smooth drive."),
            entry("Kia", "Seltos", "White", "Automatic", "Diesel", 2024, 4700, 5, "Mid-range",
                    "Badass by design. Feature-loaded mid-size SUV with connected tech."),

            // Family (4)
            entry("Maruti Suzuki", "Ertiga", "White", "Manual", "Petrol", 2024, 3800, 7, "Family",
                    "Seven-seat MPV that balances space, comfort and running costs."),
            entry("Renault", "Triber", "Silver", "Manual", "Petrol", 2023, 3000, 7, "Family",
                    "Modular seven-seater with a removable third row for extra luggage."),
            entry("Kia", "Carens", "Blue", "Automatic", "Petrol", 2024, 4200, 7, "Family",
                    "Three-row family mover with generous kit and a comfortable ride."),
            entry("Toyota", "Innova Crysta", "Silver", "Manual", "Diesel", 2023, 5500, 7, "Family",
                    "The long-distance family favourite, built for comfort and reliability."),

            // SUV (5)
            entry("Mahindra", "Scorpio-N", "Black", "Automatic", "Diesel", 2024, 5500, 7, "SUV",
                    "Big, bold body-on-frame SUV with a commanding road presence."),
            entry("Mahindra", "XUV700", "Red", "Automatic", "Petrol", 2024, 6000, 7, "SUV",
                    "Hello AdrenoX. The smart SUV with ADAS level 2 and premium tech."),
            entry("Mahindra", "Thar", "Black", "Manual", "Diesel", 2024, 5500, 4, "SUV",
                    "Explore the impossible. 4x4 off-road beast with legendary capability."),
            entry("Toyota", "Fortuner", "Black", "Automatic", "Diesel", 2024, 8000, 7, "SUV",
                    "The power to lead. Rugged, reliable, and dominating presence."),
            entry("Tata", "Harrier", "Grey", "Automatic", "Diesel", 2024, 5200, 5, "SUV",
                    "Land Rover-derived platform with a road-presence-heavy design."),

            // Electric (2)
            entry("Tata", "Tiago EV", "White", "Automatic", "Electric", 2024, 2500, 5, "Electric",
                    "India's most affordable EV. Perfect for city commutes."),
            entry("Tata", "Nexon EV", "Blue", "Automatic", "Electric", 2024, 3800, 5, "Electric",
                    "India's best-selling electric SUV. 400+ km range with fast charging."),

            // Premium (2)
            entry("Mercedes-Benz", "C-Class", "Black", "Automatic", "Petrol", 2024, 15000, 5, "Premium",
                    "Executive luxury sedan with a plush cabin and refined drive."),
            entry("BMW", "3 Series", "White", "Automatic", "Petrol", 2024, 14000, 5, "Premium",
                    "Driver-focused luxury sedan with sharp handling and a premium interior.")
    );

    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public DataSeeder(CarRepository carRepository, UserRepository userRepository,
                      ReviewRepository reviewRepository, BookingRepository bookingRepository,
                      PasswordEncoder passwordEncoder) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User admin = seedAdmin();
        reconcileFleet();
        seedReviews(admin);
    }

    private User seedAdmin() {
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            System.out.println("Admin bootstrap skipped; configure ADMIN_EMAIL and ADMIN_PASSWORD to create an administrator.");
            return null;
        }
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setName("Admin");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            System.out.println("Configured administrator account created.");
        }
        return admin;
    }

    /**
     * Brings the cars table in line with {@link #FLEET} without ever deleting a
     * car that has booking history.
     */
    void reconcileFleet() {
        List<Car> existing = new ArrayList<>(carRepository.findAll());
        Map<String, Car> byKey = new LinkedHashMap<>();
        existing.forEach(car -> byKey.putIfAbsent(key(car.getBrand(), car.getModel()), car));

        List<Car> toSave = new ArrayList<>();
        int created = 0;
        int reclassified = 0;
        for (FleetEntry entry : FLEET) {
            Car car = byKey.get(entry.key());
            if (car == null) {
                car = new Car();
                entry.applyTo(car);
                created++;
            } else if (car.getCategory() == null || !CATEGORIES.contains(car.getCategory())) {
                // Legacy values (Economy, Luxury, ...) are migrated to the
                // canonical taxonomy. Valid values are left alone so an
                // administrator's later edit is not reverted on restart.
                car.setCategory(entry.category());
                reclassified++;
            }
            toSave.add(car);
        }
        carRepository.saveAll(toSave);

        Set<String> canonical = FLEET.stream().map(FleetEntry::key).collect(Collectors.toSet());
        int removed = 0;
        int retired = 0;
        for (Car car : existing) {
            if (canonical.contains(key(car.getBrand(), car.getModel()))) continue;
            if (car.getId() != null && bookingRepository.existsByCarId(car.getId())) {
                // Foreign key protects the booking history: retire, do not delete.
                if (car.isAvailable()) {
                    car.setAvailable(false);
                    carRepository.save(car);
                }
                retired++;
            } else {
                carRepository.delete(car);
                removed++;
            }
        }
        System.out.println("Fleet reconciled: " + created + " created, " + reclassified
                + " reclassified, " + removed + " removed, " + retired
                + " retired (bookings kept), catalogue total: " + FLEET.size());
    }

    private void seedReviews(User admin) {
        if (admin == null || reviewRepository.count() > 0) return;
        Car nexon = carRepository.findAll().stream()
                .filter(car -> "Tata".equalsIgnoreCase(car.getBrand()) && "Nexon".equalsIgnoreCase(car.getModel()))
                .findFirst()
                .orElse(null);
        if (nexon == null) return;

        Review review1 = new Review();
        review1.setCar(nexon);
        review1.setUser(admin);
        review1.setRating(5);
        review1.setComment("Excellent car! Smooth driving and very clean.");
        review1.setCreatedAt(java.time.LocalDateTime.now());

        Review review2 = new Review();
        review2.setCar(nexon);
        review2.setUser(admin);
        review2.setRating(4);
        review2.setComment("Good mileage but the pickup is slightly lacking.");
        review2.setCreatedAt(java.time.LocalDateTime.now());

        reviewRepository.saveAll(List.of(review1, review2));
        System.out.println("Sample reviews seeded successfully!");
    }

    private static String key(String brand, String model) {
        return ((brand == null ? "" : brand.trim()) + "|" + (model == null ? "" : model.trim()))
                .toLowerCase(Locale.ROOT);
    }

    private static FleetEntry entry(String brand, String model, String color, String transmission,
                                    String fuelType, int year, long price, int seats, String category,
                                    String description) {
        return new FleetEntry(brand, model, color, transmission, fuelType, year, price, seats,
                category, description);
    }

    /**
     * One row of the canonical catalogue. Deliberately carries no image URL:
     * the repository ships a single generic photo for every car, so the UI
     * renders its own branded placeholder until unique photos are supplied.
     */
    private record FleetEntry(String brand, String model, String color, String transmission,
                              String fuelType, int year, long price, int seats, String category,
                              String description) {

        String key() {
            return DataSeeder.key(brand, model);
        }

        void applyTo(Car car) {
            car.setBrand(brand);
            car.setModel(model);
            car.setColor(color);
            car.setTransmission(transmission);
            car.setFuelType(fuelType);
            car.setYear(year);
            car.setPricePerDay(BigDecimal.valueOf(price));
            car.setDescription(description);
            car.setImageUrl(null);
            car.setAvailable(true);
            car.setSeats(seats);
            car.setCategory(category);
        }
    }
}
