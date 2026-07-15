package backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileService {

    private final Path uploadPath = Paths.get("Backend","uploads");

    public String uploadImage(MultipartFile file){

        try{

            if(!Files.exists(uploadPath)){
                Files.createDirectories(uploadPath);
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

            Files.copy(
                    file.getInputStream(),
                    uploadPath.resolve(fileName),
                    StandardCopyOption.REPLACE_EXISTING
            );

            return fileName;

        }catch (IOException e){

            throw new RuntimeException("Upload image failed");

        }

    }

}