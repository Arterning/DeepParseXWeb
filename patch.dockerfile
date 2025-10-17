FROM fba_ui_base AS build

WORKDIR /fba_ui
COPY . .
RUN pnpm run build

FROM nginx

COPY ./deploy/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /fba_ui/dist /www/fba_ui

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
