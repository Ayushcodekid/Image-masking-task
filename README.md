Technologies Used
Frontend:

React: JavaScript library for building user interfaces.
Material-UI (MUI): UI framework for React with pre-designed components.
react-dropzone: Dropzone for handling file uploads.
react-canvas-draw: Canvas drawing library for React.
Styling:

MUI for responsive design and theming.
State Management:

React useState for managing state locally.



GitHub repository link: https://github.com/Ayushcodekid/Image-masking-task.git


How to run the project locally

1. Clone the repository:  
git clone https://github.com/your-username/image-masking-app.git

2. Navigate to the project directory: 
cd image-masking-app

3. Install dependencies: 
npm install react-scripts --force   (im having to use --force , as there is some issue regarding npm)

4. Start the development server:
npm start





Usage
Upload an image:
Drag and drop an image file onto the dropzone or click to select an image.

Edit the image:
Draw on the image using the drawing tools.
Adjust brush size using the respective buttons.
Use the zoom in and zoom out buttons to modify the canvas view.

Save the image with drawing:
Click on the save icon to save the current canvas state as an image file.

Clear/Reset the canvas:
Clear the current drawing using the "Clear" button.
Reset the entire application to its initial state using the "Reset" button.

Local Storage Integration:
The application stores the uploaded image, mask, and canvas data in localStorage.
When you upload a new image, previous image data is cleared from localStorage to ensure only the latest data is persisted.




Libraries Used
react-canvas-draw: Provides the drawing functionality on the canvas.
react-dropzone: Simplifies the file drop handling process.
material-ui/core: For MUI components (buttons, icons, etc.).





Challenges Faced
State Management:
Managing states for image, brush size, and canvas drawing across components.
Implementing persistent state using localStorage and ensuring old data is cleared before saving new data.
Responsive Design:
Ensuring the UI adapts to different screen sizes, especially for the canvas and controls.
Performance:
Optimizing canvas drawing operations to maintain smooth performance, especially with high-resolution images.
