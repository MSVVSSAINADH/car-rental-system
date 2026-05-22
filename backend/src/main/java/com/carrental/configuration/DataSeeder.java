package com.carrental.configuration;

import com.carrental.entity.Car;
import com.carrental.entity.User;
import com.carrental.enums.UserRole;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import com.carrental.entity.Review;
import com.carrental.repository.ReviewRepository;

@Component
public class DataSeeder implements CommandLineRunner {
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CarRepository carRepository, UserRepository userRepository,
                      BookingRepository bookingRepository, ReviewRepository reviewRepository,
                      PasswordEncoder passwordEncoder) {
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Create or update default admin user with BCrypt password
        User admin = userRepository.findByEmail("admin@carrentalx.com").orElse(new User());
        admin.setName("Admin");
        admin.setEmail("admin@carrentalx.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(UserRole.ADMIN);
        userRepository.save(admin);
        System.out.println("Default admin user updated/created successfully!");
        System.out.println("Email: admin@carrentalx.com | Password: admin123");

        // Clear existing reviews, bookings and cars, then seed new ones
        reviewRepository.deleteAll();
        bookingRepository.deleteAll();
        carRepository.deleteAll();

        List<Car> cars = Arrays.asList(
                // Economy SUVs
                createCar("Tata", "Nexon", "Blue", "Manual", "Petrol", 2024, 3500L,
                        "5-Star safety rated compact SUV with bold design and premium features.", "/cars/nexon.jpg", 5, "Economy"),
                createCar("Tata", "Punch", "Orange", "Manual", "Petrol", 2024, 3000L,
                        "India's safest micro-SUV. Compact yet spacious with 5-star safety.", "/cars/punch.jpg", 5, "Economy"),
                createCar("Maruti Suzuki", "Brezza", "Grey", "Automatic", "Petrol", 2024, 3800L,
                        "Hot and Techy. Compact SUV for the modern generation.", "/cars/brezza.jpg", 5, "Economy"),
                createCar("Kia", "Sonet", "Red", "Automatic", "Petrol", 2024, 3600L,
                        "Bold and beautiful compact SUV with segment-first features.", "/cars/sonet.jpg", 5, "Economy"),

                // Premium SUVs
                createCar("Hyundai", "Creta", "White", "Automatic", "Diesel", 2024, 4500L,
                        "The ultimate mid-size SUV. Premium interiors and smooth drive.", "/cars/creta.jpg", 5, "Premium"),
                createCar("Mahindra", "Scorpio", "Silver", "Manual", "Diesel", 2023, 4800L,
                        "The SUV that started it all. Rugged, powerful, and reliable.", "/cars/scorpio.jpg", 7, "Premium"),
                createCar("Kia", "Seltos", "White", "Automatic", "Diesel", 2024, 4700L,
                        "Badass by design. Feature-loaded mid-size SUV with connected tech.", "/cars/seltos.jpg", 5, "Premium"),
                createCar("Mahindra", "XUV700", "Red", "Automatic", "Petrol", 2024, 6000L,
                        "Hello AdrenoX. The smart SUV with ADAS level 2 and premium tech.", "/cars/xuv700.jpg", 7, "Premium"),

                // Luxury SUVs
                createCar("Mahindra", "Thar", "Black", "Manual", "Diesel", 2024, 5500L,
                        "Explore the impossible. 4x4 off-road beast with legendary capability.", "/cars/thar.jpg", 4, "Luxury"),
                createCar("Toyota", "Fortuner", "Black", "Automatic", "Diesel", 2024, 8000L,
                        "The power to lead. Rugged, reliable, and dominating presence.", "/cars/fortuner.jpg", 7, "Luxury"),

                // Economy Sedans
                createCar("Maruti Suzuki", "Dzire", "Silver", "Manual", "Petrol", 2024, 2800L,
                        "India's favorite sedan. Fuel efficient and spacious.", "/cars/dzire.jpg", 5, "Economy"),
                createCar("Hyundai", "Aura", "Silver", "Manual", "Petrol", 2024, 2700L,
                        "Brilliant compact sedan with modern styling and features.", "/cars/aura.jpg", 5, "Economy"),
                createCar("Honda", "Amaze", "White", "Manual", "Petrol", 2023, 2900L,
                        "Amazing value. Compact sedan with spacious interiors.", "/cars/amaze.jpg", 5, "Economy"),

                // Premium Sedans
                createCar("Hyundai", "Verna", "White", "Automatic", "Petrol", 2024, 4200L,
                        "Sensuous sportiness. Premium sedan with cutting-edge technology.", "/cars/verna.jpg", 5, "Premium"),
                createCar("Honda", "City", "Grey", "Automatic", "Petrol", 2024, 4000L,
                        "The original sedan. Class, comfort, and performance in one.", "/cars/city.jpg", 5, "Premium"),
                createCar("Skoda", "Slavia", "Red", "Automatic", "Petrol", 2024, 4400L,
                        "Simply clever. European design with dynamic performance.", "/cars/slavia.jpg", 5, "Premium"),

                // Luxury Sedans
                createCar("Volkswagen", "Virtus", "Blue", "Automatic", "Petrol", 2024, 4500L,
                        "German engineering meets Indian roads. Premium and powerful.", "/cars/virtus.jpg", 5, "Luxury"),
                createCar("Maruti", "Ciaz", "Brown", "Automatic", "Petrol", 2023, 3200L,
                        "Crafted futurism. Spacious sedan with premium comfort.", "/cars/ciaz.jpg", 5, "Luxury"),

                // Electric vehicles
                createCar("Tata", "Nexon EV", "Blue", "Automatic", "Electric", 2024, 3800L,
                        "India's best-selling electric SUV. 400+ km range with fast charging.", "/cars/nexon_ev.jpg", 5, "Electric"),
                createCar("Tata", "Tiago EV", "White", "Automatic", "Electric", 2024, 2500L,
                        "India's most affordable EV. Perfect for city commutes.", "/cars/tiago_ev.jpg", 5, "Electric"),
                createCar("MG", "Comet EV", "Green", "Automatic", "Electric", 2024, 2200L,
                        "Cute and compact electric car. Ideal for urban mobility.", "/cars/comet_ev.jpg", 4, "Electric"),
                createCar("Mahindra", "XUV400", "Red", "Automatic", "Electric", 2024, 4500L,
                        "Born electric. Powerful electric SUV with thrilling performance.", "/cars/xuv400.jpg", 5, "Electric"));

        carRepository.saveAll(cars);
        System.out.println("Cars seeded successfully! Total: " + cars.size() + " cars");

        // Seed some sample reviews for the first car (Nexon) and admin user
        Car nexon = cars.get(0);
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

        reviewRepository.saveAll(Arrays.asList(review1, review2));
        System.out.println("Sample reviews seeded successfully!");
    }

    private Car createCar(String brand, String model, String color, String transmission,
                          String fuelType, int year, Long price, String description, String image,
                          int seats, String category) {
        Car car = new Car();
        car.setBrand(brand);
        car.setModel(model);
        car.setColor(color);
        car.setTransmission(transmission);
        car.setFuelType(fuelType);
        car.setYear(year);
        car.setPricePerDay(BigDecimal.valueOf(price));
        car.setDescription(description);
        car.setImageUrl(image);
        car.setAvailable(true);
        car.setSeats(seats);
        car.setCategory(category);
        return car;
    }
}
