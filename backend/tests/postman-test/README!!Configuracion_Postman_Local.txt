Configuración local de Postman

1. Importar en Postman:
   - PHP SQLite JWT API.postman_collection.json
   - Local PHP API.postman_environment.json

2. Seleccionar el environment “Local PHP API”.

3. Crear/inicializar la base de datos:
   - Cambiar temporalmente la variable allow_reset a true.
   - Ejecutar el request POST /reset de la colección de Ejecucion manual/Setup.
   - Verificar que responda correctamente y que se cree/inicialice data.db usando dump.sql.
   - Volver a configurar allow_reset como false.

3. Configurar estas variables:
   - base_url: URL local de la API, por ejemplo:
     http://localhost/Inventory/backend
   - qa_admin_email: email de un usuario administrador existente (admin@example.com).
   - qa_admin_password: contraseña de ese administrador (admin123).
   - run_file_tests: true para ejecutar las pruebas de imágenes.
   - qa_expired_jwt: opcional; usar solo si se quiere probar un JWT realmente vencido.

4. En Postman, configurar el Working Directory apuntando a la carpeta:
   postman-tests

5. Dentro de esa carpeta deben existir:
   - valid.png: imagen válida.
   - invalid.txt: archivo no permitido.
   - large.png: imagen mayor a 5 MB.

6. Ejecutar la carpeta “Suite automatizada · ejecutar completa” desde el Collection Runner.

La colección crea automáticamente los datos temporales necesarios y realiza la limpieza al finalizar. No es necesario configurar manualmente los IDs, JWT temporales ni variables QA generadas durante la ejecución.
