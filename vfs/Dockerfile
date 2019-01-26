FROM python:2

WORKDIR /problem/
COPY requirements.txt ./
RUN pip install -r requirements.txt

COPY . ./

EXPOSE 9630
CMD ["python", "."]