UNBOUND: FULL-STACK SETUP GUIDE



Welcome to UnBound. This project is a hybrid-architecture Traveling Salesman Problem (TSP) visualizer and solver. Because it uses a high-performance C-Engine for heavy algorithmic lifting, you cannot just run "npm start" and walk away.



You need to spin up three separate layers: The Core (C++), the API (Python), and the UI (React).





\--- PREREQUISITES ---



Before you start, make sure you have these installed on your system:

\- Git (to clone the repo)

\- Node.js \& npm (for the React frontend)

\- Python 3.9+ (for the FastAPI backend)

\- MinGW / GCC Compiler (Crucial for Windows users to build the C-Engine. If you have CLion installed, you already have this).





\--- STEP 1: CLONE THE REPOSITORY ---



Open your terminal and pull the code to your local machine:



git clone https://github.com/YOUR\_USERNAME/UnBound.git

cd UnBound





\--- STEP 2: BUILD THE C-ENGINE (THE CORE) ---



Because Git ignores compiled .dll binaries to keep the repository clean, you must compile the engine locally so it perfectly matches your CPU architecture.



1\. Navigate to the core directory:

&#x20;  cd backend/core



2\. Compile the DLL. You can do this by opening the folder in CLion and hitting the "Build" hammer, OR run this raw GCC command in your terminal:

&#x20;  gcc -shared -o libunbound\_engine.dll -O3 -fopenmp tsp\_exact.c tsp\_approx.c utils.c generator.c io\_handler.c experiment.c



3\. Move the DLL to the API folder. The Python backend needs to see this file.

&#x20;  - Windows: Copy libunbound\_engine.dll and paste it into the backend/api folder.

&#x20;  - Linux/Mac: If you compiled a .so or .dylib, move that to backend/api instead.





\--- STEP 3: SPIN UP THE BACKEND (THE API) ---



This layer acts as the bridge, allowing the web frontend to talk to the compiled C-Engine.



1\. Open a new terminal window and navigate to the API folder:

&#x20;  cd backend/api



2\. Install the required Python libraries:

&#x20;  pip install fastapi uvicorn pydantic



3\. Boot up the server:

&#x20;  python -m uvicorn main:app --reload



\[Note: You should see a message saying: Uvicorn running on http://127.0.0.1:8000]





\--- STEP 4: SPIN UP THE FRONTEND (THE UI) ---



Leave the Python terminal running. Now, we start the visualizer.



1\. Open a third terminal window and navigate to the frontend folder:

&#x20;  cd frontend



2\. Install the Node modules (this might take a minute):

&#x20;  npm install



3\. Start the development server:

&#x20;  npm run dev



\[Note: The terminal will give you a localhost link, usually http://localhost:5173. Ctrl+Click it to open UnBound in your browser.]





\--- TROUBLESHOOTING \& FATAL ERRORS ---



Error: "Failed to reach C engine" (Frontend)

If you type N=10 in the Lab and the UI flashes red with this error, it means your Python backend crashed because it couldn't execute the DLL.

\- Check the Python Terminal: Look at the error output.

\- Missing Dependencies: If it says "OSError: \[WinError 126] The specified module could not be found", your system is missing the MinGW runtime libraries.

\- The Fix: Go to your MinGW installation folder (e.g., C:\\Program Files\\JetBrains\\CLion...\\bin\\mingw\\bin\\). Find libgomp-1.dll and libwinpthread-1.dll. Copy them and paste them directly into backend/api right next to your libunbound\_engine.dll and main.py. Restart the Python server.



Error: "gcc is not recognized" (Backend/Core)

Your system doesn't know where your C compiler is. You need to add MinGW to your Windows "Environment Variables" (PATH), or just open the project in CLion and let the IDE handle the compilation.



The UI is completely blank





\--- ADDENDUM: STANDALONE CLI ENGINE (UnBound CLI) ---



While the web interface provides a visual experience, the UnBound CLI is a high-performance terminal application designed for raw algorithmic power and research-grade benchmarking. 



1\. WHY USE THE CLI?

\- Speed: By bypassing the browser and the Python API layer, the algorithms run at the absolute limit of your hardware.

\- Parallel Power: The CLI is built with OpenMP to utilize all available CPU threads of your Nitro's hardware for parallel backtracking.

\- Stability: It has hardcoded limits for the Lab mode (N=3 to N=20) to ensure the system remains stable during intensive solving.

\- TSPLIB Native Support: It can parse and solve standard .txt dataset files used in academic research.



2\. HOW TO RUN IT

\- Navigate to the "UnBound CLI" folder.

\- Ensure the following files are present in that folder:

&#x20;   \* unbound\_cli.exe (The engine)

&#x20;   \* libgomp-1.dll (Multi-processing support)

&#x20;   \* libwinpthread-1.dll (Thread management)

&#x20;   \* libgcc\_s\_dw2-1.dll (Runtime support)

\- Double-click unbound\_cli.exe or run it via PowerShell: ./unbound\_cli.exe.



3\. OPERATING MODES

The CLI offers three distinct work environments:



MODE 1: SANDBOX SOLVER

\- Use this for quick, one-off tests.

\- You can generate a random metric matrix or manually enter your own distances.

\- Returns the optimal cost, execution time, and the exact path sequence (e.g., 0 -> 4 -> 2 -> 0).



MODE 2: PERFORMANCE LAB

\- Specifically for analyzing algorithm efficiency and approximation ratios.

\- Automatically runs every algorithm for every node count from 3 up to 20.

\- Outputs tables for Cost Ratios (Accuracy), Time Ratios, and Raw Execution Times in milliseconds.



MODE 3: FILE PROCESSOR

\- Enter the absolute path to any TSPLIB-compatible .txt file.

\- The engine runs a diagnostic check for symmetry and triangle inequality before solving.

Check your React terminal. If you forgot to run "npm install", the UI has no libraries to render the components.

