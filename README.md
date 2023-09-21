# Image Search

From this video tutorial by Beyond Fireship

https://www.youtube.com/watch?v=mBcBoGhFndY

## Steps

1. `npm init -y`
2. `npm i weaviate-ts-client`
3. Go to [weaviate docker compose wizard site](https://weaviate.io/developers/weaviate/installation/docker-compose) to get the docker file

```
curl -o docker-compose.yml "https://configuration.weaviate.io/v2/docker-compose/docker-compose.yml?generative_cohere=false&image_neural_model=pytorch-resnet50&media_type=image&modules=modules&ref2vec_centroid=false&runtime=docker-compose&weaviate_version=v1.19.0"
```

4. `docker-compose up -d`
5. Implement index.js