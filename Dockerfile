FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

#set environment variables
ENV PORT=4444
ENV NODE_ENV=production
ENV GOOGLE_PROJECT_ID=curious-kingdom-398108
ENV GOOGLE_PROJECT_LOCATION=us-east1
ENV GOOGLE_APPLICATION_CREDENTIALS=curious-kingdom-398108-bb6edf68c75b.json
ENV GOOGLE_BUCKET_NAME=visibuy_product_images

EXPOSE 4444
CMD ["npm", "start"]