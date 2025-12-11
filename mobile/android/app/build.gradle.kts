plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Read local.properties file for API key
val mapsApiKey = run {
    val localPropertiesFile = rootProject.file("local.properties")
    if (localPropertiesFile.exists()) {
        val lines = localPropertiesFile.readLines()
        val apiKeyLine = lines.find { it.startsWith("MAPS_API_KEY=") }
        val key = apiKeyLine?.substringAfter("=")?.trim() ?: ""
        // Debug output to verify key is loaded
        println("=== DEBUG: Maps API Key ===")
        println("Key loaded: ${if (key.isNotEmpty()) "YES (${key.length} chars)" else "NO - EMPTY!"}")
        if (key.isNotEmpty()) {
            println("First 10 chars: ${key.take(10)}...")
        }
        key
    } else {
        println("=== DEBUG: local.properties not found ===")
        ""
    }
}

android {
    namespace = "com.example.movescrow"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = "27.0.12077973"  // Updated to match plugin requirements

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_11.toString()
    }

    defaultConfig {
        // Application ID for Movescrow
        applicationId = "com.movescrow.app"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        
        // Google Maps API Key from local.properties (secure)
        manifestPlaceholders["MAPS_API_KEY"] = mapsApiKey
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}
